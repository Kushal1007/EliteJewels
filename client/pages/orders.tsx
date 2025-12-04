"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

/**
 * Admin Orders (phone-based, auto+91 normalization, improved UI)
 *
 * - Ensures phone is normalized to +91XXXXXXXXXX before any insert/read.
 * - Uses user_phone only (no user_email).
 * - Better responsive layout and clearer controls.
 */

type ItemRow = {
  id: string;
  name: string;
  code?: string | null;
  image?: string | null;
  quantity: number;
  rate?: number | null;
};

function randId() {
  return Math.random().toString(36).slice(2, 9);
}

/** Normalize phone to +91XXXXXXXXXX where possible.
 * Accepts inputs like:
 *  - "7899013601" -> "+917899013601"
 *  - "0917899013601" -> "+917899013601"
 *  - "+917899013601" -> "+917899013601"
 *  - "917899013601" -> "+917899013601"
 * If it can't normalize sensibly, returns trimmed numeric-only with a leading +.
 */
function normalizeToPlus91(raw?: string) {
  if (!raw) return "";
  // remove all non-digits
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 10) {
    return "+91" + digits;
  }
  if (digits.length === 11 && digits.startsWith("0")) {
    // leading 0, drop then prefix +91
    return "+91" + digits.slice(1);
  }
  if (digits.length === 12 && digits.startsWith("91")) {
    return "+" + digits;
  }
  if (digits.length === 13 && digits.startsWith("091")) {
    return "+91" + digits.slice(3);
  }
  // fallback: if already includes + and digits long enough, keep + +digits
  if (raw.trim().startsWith("+") && digits.length >= 10) {
    return "+" + digits;
  }
  // last resort: return digits prefixed with +
  return "+" + digits;
}

export default function AdminOrdersPage() {
  // Form state (phone-based)
  const [userPhoneRaw, setUserPhoneRaw] = useState("");
  const [items, setItems] = useState<ItemRow[]>([
    { id: randId(), name: "", code: "", image: "", quantity: 1, rate: null },
  ]);

  const [totalweight, setTotalweight] = useState("");
  const [advancepaid, setAdvancepaid] = useState<string>("");
  const [balanceamount, setBalanceamount] = useState<string>("");
  const [estimateddelivery, setEstimateddelivery] = useState<string>("");
  const [deliveredAt, setDeliveredAt] = useState<string>("");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState("pending");
  const [ref, setRef] = useState("");

  // total price computed or override
  const [computedTotal, setComputedTotal] = useState<number | null>(null);
  const [useCustomTotal, setUseCustomTotal] = useState(false);
  const [customTotal, setCustomTotal] = useState<string>("");

  // UI state
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);
  const [profilesList, setProfilesList] = useState<string[]>([]);
  const [refreshFlag, setRefreshFlag] = useState(0);

  // fetch profiles and orders
  useEffect(() => { fetchProfiles(); }, []);
  useEffect(() => { fetchOrders(); }, [refreshFlag]);

  // recompute when items change
  useEffect(() => { computeTotalFromItems(); }, [items]);

  async function fetchProfiles() {
    try {
      // fetch phone numbers in profiles for datalist suggestions
      const { data, error } = await supabase
        .from("profiles")
        .select("phone")
        .not("phone", "is", null)
        .limit(200);

      if (!error && data) {
        // normalize stored phones if they exist — show friendly values in datalist
        const normalized = data
          .map((r: any) => (r.phone ? normalizeToPlus91(r.phone) : null))
          .filter(Boolean);
        setProfilesList(Array.from(new Set(normalized)));
      } else if (error) {
        console.warn("fetchProfiles error", error);
      }
    } catch (err) {
      console.error("fetchProfiles error", err);
    }
  }

  async function fetchOrders() {
    try {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .order("orderdate", { ascending: false })
        .limit(200);

      if (!error && data) setOrders(data);
      else if (error) console.warn("fetchOrders error", error);
    } catch (err) {
      console.error("fetchOrders unexpected", err);
    }
  }

  function addItemRow() {
    setItems((s) => [...s, { id: randId(), name: "", code: "", image: "", quantity: 1, rate: null }]);
  }

  function removeItemRow(id: string) {
    setItems((s) => s.filter((it) => it.id !== id));
  }

  function updateItem(id: string, key: keyof ItemRow, value: any) {
    setItems((s) => s.map((it) => (it.id === id ? ({ ...it, [key]: value }) : it)));
  }

  function computeTotalFromItems() {
    let sum = 0;
    for (const it of items) {
      const r = Number(it.rate ?? 0);
      const q = Number(it.quantity ?? 0);
      if (!isNaN(r) && !isNaN(q)) sum += r * q;
    }
    setComputedTotal(Number.isFinite(sum) ? sum : null);
  }

  function generateRef() {
    const now = Date.now().toString();
    const short = now.slice(-6);
    const r = `REF-${short}-${Math.random().toString(36).slice(2,5).toUpperCase()}`;
    setRef(r);
    return r;
  }

  function validateForm(normalizedPhone: string) {
    if (!normalizedPhone || normalizedPhone.trim() === "") { alert("Enter customer phone number (will be formatted to +91...)"); return false; }
    if (items.length === 0) { alert("Add at least one item"); return false; }
    for (const it of items) {
      if (!it.name || it.name.trim() === "") { alert("Each item must have a name"); return false; }
      if (!it.quantity || it.quantity < 1) { alert("Each item must have quantity >= 1"); return false; }
      if (it.rate !== null && it.rate !== undefined && isNaN(Number(it.rate))) { alert("Item rate must be a number"); return false; }
    }
    if (useCustomTotal && customTotal !== "" && isNaN(Number(customTotal))) { alert("Custom total must be numeric"); return false; }
    return true;
  }

  // insert order using phone number (user_phone) after normalization
  async function submitOrder() {
    const normalizedPhone = normalizeToPlus91(userPhoneRaw);
    if (!validateForm(normalizedPhone)) return;

    setLoading(true);
    const phone = normalizedPhone;
    const chosenRef = ref || generateRef();

    try {
      // ensure profile exists by phone (insert normalized phone)
      const { data: found, error: selErr } = await supabase
        .from("profiles")
        .select("id")
        .eq("phone", phone)
        .limit(1);

      if (selErr) console.warn("profiles select warning", selErr);

      if (!found || found.length === 0) {
        const { error: insProfileErr } = await supabase.from("profiles").insert([{ phone }]);
        if (insProfileErr) {
          console.warn("profiles insert warning", insProfileErr);
          // continue — profile isn't required for order insert if RLS/policies allow
        } else {
          // refresh suggestions
          fetchProfiles();
        }
      }

      // prepare items payload
      const payloadItems = items.map(it => ({
        name: it.name,
        code: it.code || null,
        image: it.image || null,
        quantity: Number(it.quantity),
        rate: it.rate == null ? null : Number(it.rate),
      }));

      const payload = {
        user_phone: phone,
        items: payloadItems,
        totalweight: totalweight || null,
        advancepaid: advancepaid === "" ? null : Number(advancepaid),
        balanceamount: balanceamount === "" ? null : Number(balanceamount),
        estimateddelivery: estimateddelivery || null,
        delivered_at: deliveredAt || null,
        notes: notes || null,
        status: status || "pending",
        totalprice: useCustomTotal ? (customTotal === "" ? null : Number(customTotal)) : (computedTotal ?? null),
        ref: chosenRef,
      };

      const { data: inserted, error: insertErr } = await supabase
        .from("orders")
        .insert([payload])
        .select()
        .single();

      if (insertErr) {
        console.error("orders insert error", insertErr);
        alert("Failed to add order. Check console for details (RLS/permission or schema mismatch).");
        setLoading(false);
        return;
      }

      alert("Order added successfully.");
      // reset form
      setUserPhoneRaw("");
      setItems([{ id: randId(), name: "", code: "", image: "", quantity: 1, rate: null }]);
      setTotalweight("");
      setAdvancepaid("");
      setBalanceamount("");
      setEstimateddelivery("");
      setDeliveredAt("");
      setNotes("");
      setStatus("pending");
      setRef("");
      setUseCustomTotal(false);
      setCustomTotal("");
      setComputedTotal(null);

      setRefreshFlag(f => f + 1);
    } catch (err) {
      console.error("submitOrder unexpected error", err);
      alert("Unexpected error. See console.");
    } finally {
      setLoading(false);
    }
  }

  async function deleteOrder(id?: string) {
    if (!id) return;
    // eslint-disable-next-line no-alert
    if (!confirm("Delete this order permanently?")) return;
    try {
      const { error } = await supabase.from("orders").delete().eq("id", id);
      if (error) {
        console.error("delete error", error);
        alert("Failed to delete order.");
        return;
      }
      alert("Order deleted.");
      setRefreshFlag(f => f + 1);
    } catch (err) {
      console.error(err);
      alert("Unexpected error while deleting order.");
    }
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto py-8 space-y-8 px-4 sm:px-6 lg:px-8">
        <Card>
          <CardHeader>
            <CardTitle>Add / Create Order (Phone)</CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <Label>Customer Phone Number</Label>
                <Input
                  placeholder="+91 98765 43210"
                  value={userPhoneRaw}
                  onChange={(e) => setUserPhoneRaw(e.target.value)}
                  list="profiles-list"
                  className="rounded-md"
                />
                <datalist id="profiles-list">
                  {profilesList.map((ph) => <option key={ph} value={ph} />)}
                </datalist>
                <p className="text-xs text-gray-500 mt-1">
                  We will auto-format the number to <strong>+91XXXXXXXXXX</strong> before saving.
                </p>
              </div>

              <div className="flex flex-col gap-2 justify-end">
                <div>
                  <Label>Reference (ref)</Label>
                  <div className="flex gap-2">
                    <Input value={ref} onChange={(e) => setRef(e.target.value)} placeholder="REF-..." />
                    <Button size="sm" onClick={() => generateRef()}>Generate</Button>
                  </div>
                </div>

                <div className="pt-2">
                  <Button onClick={submitOrder} disabled={loading} className="w-full">
                    {loading ? "Saving..." : "Save Order"}
                  </Button>
                </div>
              </div>
            </div>

            <div>
              <Label>Items (add one or more)</Label>
              <div className="space-y-3 mt-3">
                {items.map((it, idx) => (
                  <div key={it.id} className="grid grid-cols-12 gap-2 items-center">
                    <Input className="col-span-5 md:col-span-6" placeholder="Item name" value={it.name} onChange={(e) => updateItem(it.id, "name", e.target.value)} />
                    <Input className="col-span-2 md:col-span-2" placeholder="Code" value={it.code || ""} onChange={(e) => updateItem(it.id, "code", e.target.value)} />
                    <Input className="col-span-3 md:col-span-2" placeholder="Image URL" value={it.image || ""} onChange={(e) => updateItem(it.id, "image", e.target.value)} />
                    <Input className="col-span-1 md:col-span-1" type="number" min={1} placeholder="Qty" value={it.quantity} onChange={(e) => updateItem(it.id, "quantity", Number(e.target.value))} />
                    <Input className="col-span-1 md:col-span-1" type="number" min={0} placeholder="Rate" value={it.rate == null ? "" : String(it.rate)} onChange={(e) => updateItem(it.id, "rate", e.target.value === "" ? null : Number(e.target.value))} />
                    <div className="col-span-12 flex gap-2 justify-end md:hidden">
                      {idx === items.length - 1 && <Button size="sm" onClick={addItemRow}>Add</Button>}
                    </div>
                    <div className="col-span-12 hidden md:flex md:col-span-12 justify-end gap-2">
                      <Button size="sm" variant="ghost" onClick={() => removeItemRow(it.id)}>Remove</Button>
                      {idx === items.length - 1 && <Button size="sm" onClick={addItemRow}>Add</Button>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Total Weight</Label>
                <Input value={totalweight} onChange={(e) => setTotalweight(e.target.value)} placeholder="e.g. 10g" />
              </div>
              <div>
                <Label>Advance Paid (₹)</Label>
                <Input type="number" value={advancepaid} onChange={(e) => setAdvancepaid(e.target.value)} />
              </div>
              <div>
                <Label>Balance Amount (₹)</Label>
                <Input type="number" value={balanceamount} onChange={(e) => setBalanceamount(e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Estimated Delivery</Label>
                <Input type="date" value={estimateddelivery} onChange={(e) => setEstimateddelivery(e.target.value)} />
              </div>
              <div>
                <Label>Delivered At (optional)</Label>
                <Input type="date" value={deliveredAt} onChange={(e) => setDeliveredAt(e.target.value)} />
              </div>
              <div>
                <Label>Status</Label>
                <Select value={status} onValueChange={(v) => setStatus(v)}>
                  <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">pending</SelectItem>
                    <SelectItem value="confirmed">confirmed</SelectItem>
                    <SelectItem value="in-progress">in-progress</SelectItem>
                    <SelectItem value="ready">ready</SelectItem>
                    <SelectItem value="delivered">delivered</SelectItem>
                    <SelectItem value="cancelled">cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div>
                <Label>Order Total (computed)</Label>
                <div className="flex items-center gap-2">
                  <div className="text-lg font-semibold">₹{computedTotal != null ? computedTotal.toLocaleString() : "—"}</div>
                  <Button size="sm" onClick={() => { computeTotalFromItems(); alert("Computed from item rates * qty"); }}>Recompute</Button>
                </div>
              </div>

              <div>
                <Label>Custom total?</Label>
                <div className="flex items-center gap-2">
                  <input id="useCustom" type="checkbox" checked={useCustomTotal} onChange={(e) => setUseCustomTotal(e.target.checked)} />
                  <label htmlFor="useCustom" className="text-sm">Use custom total</label>
                </div>
              </div>

              <div>
                <Label>Custom Total Value (override)</Label>
                <Input type="number" value={customTotal} onChange={(e) => setCustomTotal(e.target.value)} placeholder="Enter manual total if override" />
              </div>
            </div>

            <div>
              <Label>Notes</Label>
              <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} />
            </div>

            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => {
                setUserPhoneRaw(""); setItems([{ id: randId(), name: "", code: "", image: "", quantity: 1, rate: null }]); setTotalweight(""); setAdvancepaid(""); setBalanceamount(""); setEstimateddelivery(""); setDeliveredAt(""); setNotes(""); setStatus("pending"); setRef(""); setUseCustomTotal(false); setCustomTotal(""); setComputedTotal(null);
              }}>Reset</Button>
              <Button onClick={submitOrder} disabled={loading}>{loading ? "Saving..." : "Save & Add"}</Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent orders */}
        <Card>
          <CardHeader><CardTitle>Recent Orders</CardTitle></CardHeader>
          <CardContent>
            {orders.length === 0 ? (
              <div className="text-sm text-gray-500">No orders yet</div>
            ) : (
              <div className="space-y-4">
                {orders.map((o: any) => (
                  <div key={o.id} className="border rounded p-4">
                    <div className="flex flex-col md:flex-row justify-between gap-4">
                      <div>
                        <div className="text-sm text-gray-600">Ref: <strong>{o.ref}</strong></div>
                        <div className="text-sm text-gray-600">Order ID: <strong>{o.id}</strong></div>
                        <div className="text-sm text-gray-600">Customer Phone: <strong>{o.user_phone}</strong></div>
                        <div className="text-sm text-gray-600">Status: <strong>{o.status}</strong></div>
                        <div className="text-sm text-gray-600">Placed: <strong>{o.orderdate ? new Date(o.orderdate).toLocaleString() : "-"}</strong></div>
                        <div className="text-sm text-gray-600">Estimated: <strong>{o.estimateddelivery ?? "-"}</strong></div>
                        <div className="text-sm text-gray-600">Total Price: <strong>₹{o.totalprice ?? "-"}</strong></div>
                      </div>

                      <div className="flex flex-col gap-2 items-start md:items-end">
                        <Button size="sm" onClick={() => {
                          const summary = `Ref: ${o.ref}\nPhone: ${o.user_phone}\nTotal: ₹${o.totalprice ?? "-"}\nItems:\n${(o.items || []).map((it: any) => `- ${it.name} x${it.quantity} @ ${it.rate ?? "-"} each`).join("\n")}`;
                          navigator.clipboard?.writeText(summary);
                          alert("Order summary copied to clipboard.");
                        }}>Copy Summary</Button>

                        <Button size="sm" variant="destructive" onClick={() => deleteOrder(o.id)}>Delete</Button>
                      </div>
                    </div>

                    <div className="mt-3">
                      <div className="font-medium">Items</div>
                      <ul className="ml-5 list-disc text-sm">
                        {(o.items || []).map((it: any, i: number) => (
                          <li key={i}>{it.name} {it.code ? `(${it.code})` : ""} • qty: {it.quantity} • rate: {it.rate ? `₹${it.rate}` : "-"}</li>
                        ))}
                      </ul>
                    </div>

                    {o.notes && <div className="mt-3 text-sm bg-gray-50 p-2 rounded">{o.notes}</div>}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
