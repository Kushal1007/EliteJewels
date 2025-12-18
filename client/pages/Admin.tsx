"use client";
import { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Admin({ onProductAdded }) {
  const [name, setName] = useState("");
  const [minWeight, setMinWeight] = useState("");
  const [actualWeight, setActualWeight] = useState("");
  const [productCode, setProductCode] = useState("");
  const [plus, setPlus] = useState(""); // 🆕 PLUS FIELD
  const [material, setMaterial] = useState("gold");
  const [mainCategory, setMainCategory] = useState("short_chains");
  const [subCategory, setSubCategory] = useState<string | null>(null);
  const [style, setStyle] = useState("all");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // MAIN CATEGORIES
  const categories = [
    { id: "short_chains", name: "Short Chains" },
    { id: "mangalya", name: "Mangalya" },
    {
      id: "bracelet",
      name: "Bracelet",
      subCategories: [
        { id: "men", name: "Men" },
        { id: "women", name: "Women" },
        { id: "kids", name: "Kids" },
      ],
    },
    { id: "necklace", name: "Necklace" },
    { id: "haara", name: "Haara" },
  ];

  // STYLES
  const categoryStyles = {
    short_chains: ["all", "box", "cable", "rope", "fancy"],
    mangalya: ["all", "Strong", "Hallow", "Mope"],
    bracelet: ["all", "plain", "charm", "link", "fancy"],
    necklace: ["all", "choker", "long", "designer"],
    haara: ["all", "temple", "traditional", "modern"],
  };

  const selectedCategory = categories.find((c) => c.id === mainCategory);

  const handleAddProduct = async () => {
    if (!imageFile) {
      alert("Please select an image!");
      return;
    }

    setIsUploading(true);

    try {
      // Upload image
      const fileExt = imageFile.name.split(".").pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${mainCategory}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from(material)
        .upload(filePath, imageFile);

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from(material).getPublicUrl(filePath);

      // INSERT PRODUCT
      const { data, error } = await supabase
        .from("products")
        .insert([
          {
            name,
            min_weight: parseFloat(minWeight),
            actual_weight: actualWeight ? parseFloat(actualWeight) : null,
            product_code: productCode,
            plus: plus ? parseFloat(plus) : null, // 🆕 STORED HERE
            material,
            main_category: mainCategory,
            sub_category: mainCategory === "bracelet" ? subCategory : null,
            style,
            image_url: publicUrl,
          },
        ])
        .select();

      if (error) throw error;

      if (onProductAdded && data?.length > 0) {
        onProductAdded(data[0]);
      }

      alert("✅ Product added successfully!");

      // RESET FORM
      setName("");
      setMinWeight("");
      setActualWeight("");
      setProductCode("");
      setPlus("");
      setMainCategory("short_chains");
      setSubCategory(null);
      setStyle("all");
      setImageFile(null);

    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="p-6 max-w-lg mx-auto">
      <Card className="shadow-xl">
        <CardContent className="space-y-4 pt-6">
          <h2 className="text-xl font-semibold mb-4">🛠 Add New Product</h2>

          <Input
            placeholder="Product Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <Input
            type="number"
            placeholder="Min Weight (grams)"
            value={minWeight}
            onChange={(e) => setMinWeight(e.target.value)}
          />

          <Input
            type="number"
            placeholder="Actual Weight (optional)"
            value={actualWeight}
            onChange={(e) => setActualWeight(e.target.value)}
          />

          <Input
            placeholder="Product Code"
            value={productCode}
            onChange={(e) => setProductCode(e.target.value)}
          />

          {/* 🆕 PLUS FIELD */}
          <Input
            type="number"
            placeholder="Plus (optional)"
            value={plus}
            onChange={(e) => setPlus(e.target.value)}
          />

          {/* MATERIAL */}
          <Select value={material} onValueChange={setMaterial}>
            <SelectTrigger>
              <SelectValue placeholder="Material" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="gold">Gold</SelectItem>
              <SelectItem value="silver">Silver</SelectItem>
            </SelectContent>
          </Select>

          {/* MAIN CATEGORY */}
          <Select
            value={mainCategory}
            onValueChange={(value) => {
              setMainCategory(value);
              setSubCategory(null);
              setStyle("all");
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Main Category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* SUBCATEGORY (Bracelet only) */}
          {selectedCategory?.subCategories && (
            <Select value={subCategory ?? ""} onValueChange={setSubCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Sub Category" />
              </SelectTrigger>
              <SelectContent>
                {selectedCategory.subCategories.map((sub) => (
                  <SelectItem key={sub.id} value={sub.id}>
                    {sub.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {/* STYLE */}
          <Select value={style} onValueChange={setStyle}>
            <SelectTrigger>
              <SelectValue placeholder="Style" />
            </SelectTrigger>
            <SelectContent>
              {categoryStyles[mainCategory].map((s) => (
                <SelectItem key={s} value={s}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* IMAGE */}
          <Input
            type="file"
            accept="image/*"
            onChange={(e) => setImageFile(e.target.files?.[0] || null)}
          />

          <Button
            onClick={handleAddProduct}
            disabled={isUploading}
            className="w-full"
          >
            {isUploading ? "Uploading..." : "Add Product"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
