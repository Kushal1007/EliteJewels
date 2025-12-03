"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

export default function NewArrivalsAdmin() {
  const [name, setName] = useState("");
  const [minWeight, setMinWeight] = useState("");
  const [code, setCode] = useState("");
  const [category, setCategory] = useState("");

  const [imageFile, setImageFile] = useState(null);

  // Popups
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async () => {
    if (!name || !imageFile) {
      setErrorMsg("Name and Image are required!");
      setShowError(true);
      return;
    }

    try {
      // 1️⃣ Upload image to Supabase Storage
      const fileExt = imageFile.name.split(".").pop();
      const filePath = `new_arrivals/${Date.now()}.${fileExt}`;

      const { data: storageData, error: storageError } = await supabase.storage
        .from("new_arrivals")
        .upload(filePath, imageFile);

      if (storageError) {
        setErrorMsg("Image Upload Failed: " + storageError.message);
        setShowError(true);
        return;
      }

      // 2️⃣ Get public image URL
      const { data: publicUrl } = supabase.storage
        .from("new_arrivals")
        .getPublicUrl(filePath);

      const image_url = publicUrl.publicUrl;

      // 3️⃣ Add product to Supabase table
      const { error: insertError } = await supabase
        .from("new_arrivals")
        .insert([
          {
            name,
            min_weight: minWeight,
            code,
            category,
            image_url,
          },
        ]);

      if (insertError) {
        setErrorMsg("Database Error: " + insertError.message);
        setShowError(true);
        return;
      }

      // Success popup
      setShowSuccess(true);

      // Clear form
      setName("");
      setMinWeight("");
      setCode("");
      setCategory("");
      setImageFile(null);
    } catch (err) {
      setErrorMsg("Unexpected Error: " + err.message);
      setShowError(true);
    }
  };

  return (
    <div className="flex justify-center p-6">
      <Card className="w-full max-w-xl shadow-xl">
        <CardContent className="p-6 space-y-4">
          <h1 className="text-2xl font-bold mb-3">Add New Arrival</h1>

          <div className="space-y-2">
            <Label>Product Name</Label>
            <Input
              placeholder="Gold Necklace"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Min Weight</Label>
            <Input
              placeholder="5g"
              value={minWeight}
              onChange={(e) => setMinWeight(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Product Code</Label>
            <Input
              placeholder="GN-102"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Category</Label>
            <Input
              placeholder="Gold / Silver"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Image</Label>
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files[0])}
            />
          </div>

          <Button onClick={handleSubmit} className="w-full mt-3">
            Add Product
          </Button>
        </CardContent>
      </Card>

      {/* Success Popup */}
      <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-green-600">Success!</DialogTitle>
          </DialogHeader>
          <p>New Arrival added successfully.</p>
          <Button onClick={() => setShowSuccess(false)} className="mt-4 w-full">
            OK
          </Button>
        </DialogContent>
      </Dialog>

      {/* Error Popup */}
      <Dialog open={showError} onOpenChange={setShowError}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-red-600">Error</DialogTitle>
          </DialogHeader>
          <p>{errorMsg}</p>
          <Button
            onClick={() => setShowError(false)}
            variant="destructive"
            className="mt-4 w-full"
          >
            Close
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
