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
 * Admin Orders Panel
 * - Matches DB columns: user_email, items (jsonb), totalweight, advancepaid, balanceamount,
 *   estimateddelivery, notes, status, totalprice, ref, delivered_at
 *
 * Drop into: app/admin/orders/page.tsx (Next 13 app router) or pages/admin/orders.tsx.
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

export default function AdminOrdersPage() {
  // Form state
  const [userEmail, setUserEmail] = useState("");
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
  const [ref, setRef] = useState<string>("");

  // totalprice: auto-calculated or manual override
  const [computedTotal, setComputedTotal] = useState<number | null>(null);
  const [useCustomTotal, setUseCustomTotal] = useState(false);
  const [customTotal, setCustomTotal] = useState<string>("");

  // UI state
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);
  const [profilesList, setProfilesList] = useState<string[]>([]);
  const [refreshFlag, setRefreshFlag] = useState(0);

  // fetch profiles and recent orders
  useEffect(() => { fetchProfiles(); }, []);
  useEffect(() => { fetchOrders(); }, [refreshFlag]);

  useEffect(() => {
    // recompute total when items change
    computeTotalFromItems();
  }, [items]);

  async function fetchProfiles() {
    try {
      const { data } = await supabase.from("profiles").select("email").limit(200);
      if (data) setProfilesList(data.map((r: any) => r.email).filter(Boolean));
    } catch (err) {
      console.error("fetchProfiles error", err);
    }
  }

  async function fetchOrders() {
    try {
      const { data } = await supabase
        .from("orders")
        .select("*")
        .order("orderdate", { ascending: false })
        .limit(200);
      if (data) setOrders(data);
    } catch (err) {
      console.error("fetchOrders error", err);
    }
  }

  function addItemRow() {
    setItems((s) => [...s, { id: randId(), name: "", code: "", image: "", quantity: 1, rate: null }]);
  }

  function removeItemRow(id: string) {
    setItems((s) => s.filter((it) => it.id !== id));
  }

  function updateItem(id: string, key: keyof ItemRow, value: any) {
    setItems((s) => s.map((it) => (it.id === id ? { ...it, [key]: value } : it)));
  }

  function computeTotalFromItems() {
    let sum = 0;
    for (const it of items) {
      const r = (it.rate ?? 0);
      const q = (it.quantity ?? 0);
      // only add if rate is a valid number
      if (!isNaN(Number(r)) && !isNaN(Number(q))) sum += Number(r) * Number(q);
    }
    setComputedTotal(sum || null);
  }

  function generateRef() {
    const now = Date.now().toString();
    const short = now.slice(-6);
    const r = `REF-${short}-${Math.random().toString(36).slice(2,5).toUpperCase()}`;
    setRef(r);
    return r;
  }

  function validateForm() {
    if (!userEmail || userEmail.trim() === "") { alert("Enter customer email"); return false; }
    if (!items || items.length === 0) { alert("Add at least one item"); return false; }
    for (const it of items) {
      if (!it.name || it.name.trim() === "") { alert("Each item must have a name"); return false; }
      if (!it.quantity || it.quantity < 1) { alert("Each item must have quantity >= 1"); return false; }
      // rate optional, but if provided must be numeric
      if (it.rate !== null && it.rate !== undefined && isNaN(Number(it.rate))) { alert("Item rate must be a number"); return false; }
    }
    // totalprice if custom must be numeric
    if (useCustomTotal && customTotal !== "" && isNaN(Number(customTotal))) { alert("Custom total must be numeric"); return false; }
    return true;
  }

  // MAIN: insert order into Supabase (snake_case column names)
  async function submitOrder() {
    if (!validateForm()) return;
    setLoading(true);
    const email = userEmail.trim().toLowerCase();
    const chosenRef = ref || generateRef();

    try {
      // ensure profile exists (non-linked upsert if missing)
      const { data: found } = await supabase.from("profiles").select("id").eq("email", email).limit(1);
      if (!found || found.length === 0) {
        const { error: insProfileErr } = await supabase.from("profiles").insert([{ email }]);
        if (insProfileErr) console.warn("profiles insert warning", insProfileErr);
        else fetchProfiles();
      }

      // prepare items payload: convert rate to numeric if present
      const payloadItems = items.map(it => ({
        name: it.name,
        code: it.code || null,
        image: it.image || null,
        quantity: Number(it.quantity),
        rate: it.rate == null ? null : Number(it.rate),
      }));

      const payload = {
        user_email: email,
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
      setUserEmail("");
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
      alert("Unexpected error (see console).");
    } finally {
      setLoading(false);
    }
  }

  async function deleteOrder(id?: string) {
    if (!id) return;
    // confirm
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
      <div className="max-w-7xl mx-auto py-8 space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Add / Create Order</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Customer Email</Label>
              <Input
                placeholder="customer@example.com"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                list="profiles-list"
              />
              <datalist id="profiles-list">
                {profilesList.map((em) => <option key={em} value={em} />)}
              </datalist>
            </div>

            <div>
              <Label>Items (add one or more)</Label>
              <div className="space-y-3 mt-2">
                {items.map((it, idx) => (
                  <div key={it.id} className="grid grid-cols-12 gap-2 items-center">
                    <Input className="col-span-4" placeholder="Item name" value={it.name} onChange={(e) => updateItem(it.id, "name", e.target.value)} />
                    <Input className="col-span-2" placeholder="Code" value={it.code || ""} onChange={(e) => updateItem(it.id, "code", e.target.value)} />
                    <Input className="col-span-3" placeholder="Image URL" value={it.image || ""} onChange={(e) => updateItem(it.id, "image", e.target.value)} />
                    <Input className="col-span-1" type="number" min={1} placeholder="Qty" value={it.quantity} onChange={(e) => updateItem(it.id, "quantity", Number(e.target.value))} />
                    <Input className="col-span-1" type="number" min={0} placeholder="Rate" value={it.rate == null ? "" : String(it.rate)} onChange={(e) => updateItem(it.id, "rate", e.target.value === "" ? null : Number(e.target.value))} />
                    <div className="col-span-1 flex gap-2">
                      <Button size="sm" variant="ghost" onClick={() => removeItemRow(it.id)}>Remove</Button>
                      {idx === items.length - 1 && <Button size="sm" onClick={addItemRow}>Add</Button>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
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

            <div className="grid grid-cols-3 gap-4">
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

            <div className="grid grid-cols-3 gap-4 items-end">
              <div>
                <Label>Order Total (computed)</Label>
                <div className="flex items-center gap-2">
                  <div className="text-lg font-semibold">₹{computedTotal != null ? computedTotal.toLocaleString() : "—"}</div>
                  <Button size="sm" onClick={() => { computeTotalFromItems(); alert("Computed from item rates * qty"); }}>Recompute</Button>
                </div>
              </div>
              <div>
                <Label>Custom total?</Label>
                <div className="flex gap-2">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" checked={useCustomTotal} onChange={(e) => setUseCustomTotal(e.target.checked)} />
                    <span className="text-sm">Use custom total</span>
                  </label>
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

            <div className="grid grid-cols-3 gap-4 items-center">
              <div>
                <Label>Reference (ref)</Label>
                <div className="flex gap-2">
                  <Input value={ref} onChange={(e) => setRef(e.target.value)} placeholder="REF-..." />
                  <Button size="sm" onClick={() => generateRef()}>Generate</Button>
                </div>
              </div>
              <div>
                <Label>Save & Add</Label>
                <Button onClick={submitOrder} disabled={loading}>{loading ? "Saving..." : "Save Order"}</Button>
              </div>
              <div>
                <Label>Reset Form</Label>
                <Button variant="outline" onClick={() => {
                  setUserEmail(""); setItems([{ id: randId(), name: "", code: "", image: "", quantity: 1, rate: null }]); setTotalweight(""); setAdvancepaid(""); setBalanceamount(""); setEstimateddelivery(""); setDeliveredAt(""); setNotes(""); setStatus("pending"); setRef(""); setUseCustomTotal(false); setCustomTotal(""); setComputedTotal(null);
                }}>Reset</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent orders list */}
        <Card>
          <CardHeader><CardTitle>Recent Orders</CardTitle></CardHeader>
          <CardContent>
            {orders.length === 0 ? (
              <div className="text-sm text-gray-500">No orders yet</div>
            ) : (
              <div className="space-y-4">
                {orders.map((o: any) => (
                  <div key={o.id} className="border rounded p-4">
                    <div className="flex justify-between">
                      <div>
                        <div className="text-sm text-gray-600">Ref: <strong>{o.ref}</strong></div>
                        <div className="text-sm text-gray-600">Order ID: <strong>{o.id}</strong></div>
                        <div className="text-sm text-gray-600">Customer: <strong>{o.user_email}</strong></div>
                        <div className="text-sm text-gray-600">Status: <strong>{o.status}</strong></div>
                        <div className="text-sm text-gray-600">Placed: <strong>{o.orderdate ? new Date(o.orderdate).toLocaleString() : "-"}</strong></div>
                        <div className="text-sm text-gray-600">Estimated: <strong>{o.estimateddelivery ?? "-"}</strong></div>
                        <div className="text-sm text-gray-600">Total Price: <strong>₹{o.totalprice ?? "-"}</strong></div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Button size="sm" onClick={() => {
                          // copy order data to clipboard for quick paste into WhatsApp/admin notes
                          const summary = `Ref: ${o.ref}\nCustomer: ${o.user_email}\nTotal: ₹${o.totalprice ?? "-"}\nItems:\n${(o.items || []).map((it: any) => `- ${it.name} x${it.quantity} @ ${it.rate ?? "-"} each`).join("\n")}`;
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
