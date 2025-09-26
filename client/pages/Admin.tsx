import { useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function Admin() {
  const [name, setName] = useState("");
  const [minWeight, setMinWeight] = useState("");
  const [actualWeight, setActualWeight] = useState(""); // ✅ new field
  const [productCode, setProductCode] = useState("");
  const [material, setMaterial] = useState("gold");
  const [mainCategory, setMainCategory] = useState("rings");
  const [subCategory, setSubCategory] = useState("men");
  const [style, setStyle] = useState("all");
  const [imageFile, setImageFile] = useState<File | null>(null);

  const handleAddProduct = async () => {
    if (!imageFile) {
      alert("Please select an image");
      return;
    }

    try {
      // 1. Upload image
      const fileExt = imageFile.name.split(".").pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${material}/${mainCategory}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("products")
        .upload(filePath, imageFile);

      if (uploadError) {
        throw uploadError;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("products").getPublicUrl(filePath);

      // 2. Insert into products table
      const { error: insertError } = await supabase.from("products").insert([
        {
          name,
          min_weight: parseFloat(minWeight),
          actual_weight: actualWeight ? parseFloat(actualWeight) : null, // ✅ stored in DB only
          product_code: productCode,
          material,
          main_category: mainCategory,
          sub_category: subCategory,
          style,
          image_url: publicUrl,
        },
      ]);

      if (insertError) throw insertError;

      alert("✅ Product added successfully!");
      setName("");
      setMinWeight("");
      setActualWeight(""); // reset
      setProductCode("");
      setMaterial("gold");
      setMainCategory("rings");
      setSubCategory("men");
      setStyle("all");
      setImageFile(null);
    } catch (err: any) {
      alert(`Unexpected error: ${err.message}`);
      console.error(err);
    }
  };

  return (
    <div className="max-w-lg mx-auto mt-10 p-6 bg-white shadow rounded">
      <h2 className="text-2xl font-bold mb-6">Admin Panel</h2>

      <input
        type="text"
        placeholder="Product Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full p-2 border rounded mb-4"
      />

      <input
        type="number"
        placeholder="Min Weight"
        value={minWeight}
        onChange={(e) => setMinWeight(e.target.value)}
        className="w-full p-2 border rounded mb-4"
      />

      {/* ✅ New actual weight field */}
      <input
        type="number"
        placeholder="Actual Weight"
        value={actualWeight}
        onChange={(e) => setActualWeight(e.target.value)}
        className="w-full p-2 border rounded mb-4"
      />

      <input
        type="text"
        placeholder="Product Code"
        value={productCode}
        onChange={(e) => setProductCode(e.target.value)}
        className="w-full p-2 border rounded mb-4"
      />

      <select
        value={material}
        onChange={(e) => setMaterial(e.target.value)}
        className="w-full p-2 border rounded mb-4"
      >
        <option value="gold">Gold</option>
        <option value="silver">Silver</option>
      </select>

      <select
        value={mainCategory}
        onChange={(e) => setMainCategory(e.target.value)}
        className="w-full p-2 border rounded mb-4"
      >
        <option value="rings">Rings</option>
        <option value="chains">Chains</option>
        <option value="bangles">Bangles</option>
        <option value="earrings">Earrings</option>
        <option value="necklaces">Necklaces</option>
        <option value="pendants">Pendants</option>
      </select>

      <select
        value={subCategory}
        onChange={(e) => setSubCategory(e.target.value)}
        className="w-full p-2 border rounded mb-4"
      >
        <option value="men">Men</option>
        <option value="women">Women</option>
      </select>

      <select
        value={style}
        onChange={(e) => setStyle(e.target.value)}
        className="w-full p-2 border rounded mb-4"
      >
        <option value="all">All</option>
        <option value="plain">Plain</option>
        <option value="casting">Casting</option>
        <option value="fancy">Fancy</option>
        <option value="single_stone">Single Stone</option>
      </select>

      <input
        type="file"
        accept="image/*"
        onChange={(e) => setImageFile(e.target.files?.[0] || null)}
        className="w-full p-2 border rounded mb-4"
      />

      <button
        onClick={handleAddProduct}
        className="w-full bg-yellow-600 text-white py-2 px-4 rounded hover:bg-yellow-700"
      >
        Add Product
      </button>
    </div>
  );
}
