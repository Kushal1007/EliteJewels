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
  const [material, setMaterial] = useState("gold");
  const [mainCategory, setMainCategory] = useState("rings");
  const [subCategory, setSubCategory] = useState("men");
  const [style, setStyle] = useState("all");
  const [imageFile, setImageFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  // ✅ Categories & subcategories (same as Gold page)
  const categories = [
    { id: "chains", name: "Chains" },
    { id: "earrings", name: "Earrings" },
    {
      id: "rings",
      name: "Rings",
      subCategories: [
        { id: "men", name: "Men" },
        { id: "women", name: "Women" },
      ],
    },
    { id: "haara", name: "Haara" },
    { id: "necklace", name: "Necklace" },
    {
      id: "bracelet",
      name: "Bracelet",
      subCategories: [
        { id: "men", name: "Men" },
        { id: "women", name: "Women" },
        { id: "kids", name: "Kids" },
      ],
    },
  ];

  // ✅ Styles specific to each main category
  const categoryStyles = {
    chains: ["all", "box", "cable", "rope", "fancy"],
    earrings: ["all", "stud", "hangings", "drop", "antique jhumka"],
    rings: ["all", "single stone", "plain", "couple", "fancy"],
    haara: ["all", "traditional", "temple", "modern"],
    necklace: ["all", "choker", "long", "temple", "designer"],
    bracelet: ["all", "plain", "charm", "link", "fancy"],
  };

  const handleAddProduct = async () => {
    if (!imageFile) {
      alert("Please select an image first!");
      return;
    }

    setIsUploading(true);

    try {
      // ✅ Generate unique file name
      const fileExt = imageFile.name.split(".").pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${mainCategory}/${fileName}`;

      // ✅ Upload to selected material bucket
      const { error: uploadError } = await supabase.storage
        .from(material)
        .upload(filePath, imageFile);

      if (uploadError) throw uploadError;

      // ✅ Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from(material).getPublicUrl(filePath);

      // ✅ Insert product into database
      const { data, error: insertError } = await supabase
        .from("products")
        .insert([
          {
            name,
            min_weight: parseFloat(minWeight),
            actual_weight: actualWeight ? parseFloat(actualWeight) : null,
            product_code: productCode,
            material,
            main_category: mainCategory,
            sub_category: subCategory || null,
            style,
            image_url: publicUrl,
          },
        ])
        .select();

      if (insertError) throw insertError;

      if (onProductAdded && data && data.length > 0) {
        onProductAdded(data[0]);
      }

      alert("✅ Product added successfully!");

      // Reset form
      setName("");
      setMinWeight("");
      setActualWeight("");
      setProductCode("");
      setMaterial("gold");
      setMainCategory("rings");
      setSubCategory("men");
      setStyle("all");
      setImageFile(null);
    } catch (err) {
      console.error(err);
      alert(`❌ Error: ${err.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  // ✅ Find selected category
  const selectedCategory = categories.find((c) => c.id === mainCategory);

  return (
    <div className="p-6 max-w-lg mx-auto">
      <Card className="shadow-xl">
        <CardContent className="space-y-4 pt-6">
          <h2 className="text-xl font-semibold mb-4">🛠 Add New Product</h2>

          {/* Product Name */}
          <Input
            placeholder="Product Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          {/* Min Weight */}
          <Input
            placeholder="Min Weight (grams)"
            type="number"
            value={minWeight}
            onChange={(e) => setMinWeight(e.target.value)}
          />

          {/* Actual Weight */}
          <Input
            placeholder="Actual Weight (optional)"
            type="number"
            value={actualWeight}
            onChange={(e) => setActualWeight(e.target.value)}
          />

          {/* Product Code */}
          <Input
            placeholder="Product Code"
            value={productCode}
            onChange={(e) => setProductCode(e.target.value)}
          />

          {/* Material */}
          <Select onValueChange={setMaterial} value={material}>
            <SelectTrigger>
              <SelectValue placeholder="Select Material" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="gold">Gold</SelectItem>
              <SelectItem value="silver">Silver</SelectItem>
            </SelectContent>
          </Select>

          {/* Main Category */}
          <Select
            onValueChange={(value) => {
              setMainCategory(value);
              setSubCategory(""); // reset subcategory when changing main
              setStyle("all");
            }}
            value={mainCategory}
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

          {/* Sub Category (only if exists) */}
          {selectedCategory?.subCategories && (
            <Select onValueChange={setSubCategory} value={subCategory}>
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

          {/* Style (dynamic per category) */}
          <Select onValueChange={setStyle} value={style}>
            <SelectTrigger>
              <SelectValue placeholder="Select Style" />
            </SelectTrigger>
            <SelectContent>
              {(categoryStyles[mainCategory] || ["all"]).map((s) => (
                <SelectItem key={s} value={s}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Image Upload */}
          <Input
            type="file"
            accept="image/*"
            onChange={(e) => setImageFile(e.target.files[0])}
          />

          {/* Submit */}
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
