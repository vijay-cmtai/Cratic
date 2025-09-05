
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, Edit, Trash2, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { 
  initialSupplierInventory, 
  jewelryTypes, 
  metalTypes, 
  metalPurities, 
  diamondShapes, 
  certifications, 
  occasions 
} from '@/lib/marketplaceData';
import { Separator } from '@/components/ui/separator';
import { createProductDetails } from '@/ai/flows/create-product-flow';
import { useCurrency } from '@/context/CurrencyContext';


export default function InventoryPage() {
  const { toast } = useToast();
  const { formatPrice } = useCurrency();
  const [inventory, setInventory] = useState(initialSupplierInventory);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newProduct, setNewProduct] = useState({
    jewelry_type: '',
    metal_type: '',
    metal_purity: '',
    diamond_shape: '',
    diamond_carat: '',
    price: '',
    stock: '',
    occasion: '',
    certification: '',
    description: '',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [aiDescription, setAiDescription] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setNewProduct(prev => ({ ...prev, [id]: value }));
  };

  const handleSelectChange = (id: string, value: string) => {
    setNewProduct(prev => ({ ...prev, [id]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleGenerateDetails = async () => {
    if (!aiDescription.trim()) {
      toast({
        variant: 'destructive',
        title: 'Description is empty',
        description: 'Please describe the product you want to create.',
      });
      return;
    }
    setIsGenerating(true);
    try {
      const result = await createProductDetails(aiDescription);
      setNewProduct({
        ...newProduct, // keep any existing fields like image
        jewelry_type: result.jewelry_type || '',
        metal_type: result.metal_type || '',
        metal_purity: result.metal_purity || '',
        diamond_shape: result.diamond_shape || '',
        diamond_carat: result.diamond_carat || '',
        price: result.price || '',
        stock: result.stock || '',
        occasion: result.occasion || '',
        certification: result.certification || '',
        description: result.description || '',
      });
      toast({
        title: 'Details Generated!',
        description: 'The product details have been filled in. Please review and save.',
      });
    } catch (error) {
      console.error('AI generation failed:', error);
      toast({
        variant: 'destructive',
        title: 'Generation Failed',
        description: 'Could not generate details from the description.',
      });
    } finally {
      setIsGenerating(false);
    }
  };
  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const newId = `PROD-${(inventory.length + 1).toString().padStart(3, '0')}`;
    const newItem = {
      id: newId,
      jewelry_type: newProduct.jewelry_type,
      metal: `${newProduct.metal_purity} ${newProduct.metal_type}`,
      diamond_shape: newProduct.diamond_shape,
      diamond_carat: parseFloat(newProduct.diamond_carat),
      price: parseInt(newProduct.price, 10),
      stock: parseInt(newProduct.stock, 10),
      image: imageFile ? URL.createObjectURL(imageFile) : 'https://placehold.co/80x80.png',
      hint: newProduct.jewelry_type.toLowerCase(),
    };

    setInventory(prev => [...prev, newItem]);
    toast({
      title: 'Success!',
      description: `Product ${newId} has been added to your inventory.`,
    });

    // Reset form
    setNewProduct({ jewelry_type: '', metal_type: '', metal_purity: '', diamond_shape: '', diamond_carat: '', price: '', stock: '', occasion: '', certification: '', description: '' });
    setImageFile(null);
    setAiDescription('');
    setIsDialogOpen(false);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Product Inventory</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Upload className="mr-2 h-4 w-4" /> Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-2xl">
            <form onSubmit={handleAddProduct}>
              <DialogHeader>
                <DialogTitle className="font-headline text-2xl">Add New Product</DialogTitle>
                <DialogDescription>Fill in the details, or describe your product and let AI help.</DialogDescription>
              </DialogHeader>

              <div className="py-4 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="ai-description">Describe your product to generate details with AI</Label>
                  <div className="flex gap-2">
                    <Textarea 
                      id="ai-description" 
                      placeholder="e.g., A beautiful 1.5 carat oval diamond engagement ring in 18K white gold" 
                      value={aiDescription}
                      onChange={(e) => setAiDescription(e.target.value)}
                      disabled={isGenerating}
                    />
                    <Button type="button" onClick={handleGenerateDetails} disabled={isGenerating}>
                      {isGenerating ? 'Generating...' : <><Sparkles className="mr-2 h-4 w-4" /> Generate</>}
                    </Button>
                  </div>
                </div>
                <Separator />
              </div>

              <div className="grid gap-6 max-h-[50vh] overflow-y-auto pr-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="image">Product Image</Label>
                    <Input id="image" type="file" onChange={handleFileChange} />
                  </div>
                   <div>
                    <Label htmlFor="jewelry_type">Jewelry Type</Label>
                    <Select value={newProduct.jewelry_type} onValueChange={(value) => handleSelectChange('jewelry_type', value)}><SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger><SelectContent>{jewelryTypes.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="metal_type">Metal Type</Label>
                    <Select value={newProduct.metal_type} onValueChange={(value) => handleSelectChange('metal_type', value)}><SelectTrigger><SelectValue placeholder="Select metal" /></SelectTrigger><SelectContent>{metalTypes.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent></Select>
                  </div>
                  <div>
                    <Label htmlFor="metal_purity">Metal Purity</Label>
                    <Select value={newProduct.metal_purity} onValueChange={(value) => handleSelectChange('metal_purity', value)}><SelectTrigger><SelectValue placeholder="Select purity" /></SelectTrigger><SelectContent>{metalPurities.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent></Select>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                   <div>
                    <Label htmlFor="diamond_shape">Diamond Shape</Label>
                    <Select value={newProduct.diamond_shape} onValueChange={(value) => handleSelectChange('diamond_shape', value)}><SelectTrigger><SelectValue placeholder="Select shape" /></SelectTrigger><SelectContent>{diamondShapes.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select>
                  </div>
                  <div>
                    <Label htmlFor="diamond_carat">Diamond Carat</Label>
                    <Input id="diamond_carat" type="number" step="0.01" value={newProduct.diamond_carat} onChange={handleInputChange} />
                  </div>
                  <div>
                    <Label htmlFor="certification">Certification</Label>
                    <Select value={newProduct.certification} onValueChange={(value) => handleSelectChange('certification', value)}><SelectTrigger><SelectValue placeholder="Select lab" /></SelectTrigger><SelectContent>{certifications.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent></Select>
                  </div>
                </div>

                 <div>
                  <Label htmlFor="occasion">Occasion</Label>
                  <Select value={newProduct.occasion} onValueChange={(value) => handleSelectChange('occasion', value)}><SelectTrigger><SelectValue placeholder="Select occasion" /></SelectTrigger><SelectContent>{occasions.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent></Select>
                </div>

                 <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" placeholder="e.g. Classic solitaire engagement ring..." value={newProduct.description} onChange={handleInputChange} />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="price">Price (USD)</Label>
                      <Input id="price" type="number" value={newProduct.price} onChange={handleInputChange} placeholder="e.g. 12500" />
                    </div>
                    <div>
                      <Label htmlFor="stock">Stock Quantity</Label>
                      <Input id="stock" type="number" value={newProduct.stock} onChange={handleInputChange} placeholder="e.g. 10" />
                    </div>
                </div>
              </div>
              <DialogFooter className="mt-4 pt-4 border-t">
                <Button type="submit">Save Product</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="border rounded-lg mt-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product ID</TableHead>
              <TableHead>Image</TableHead>
              <TableHead>Jewelry Type</TableHead>
              <TableHead>Metal</TableHead>
              <TableHead>Diamond</TableHead>
              <TableHead className="text-right">Price</TableHead>
              <TableHead className="text-right">Stock</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {inventory.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-mono text-sm">{item.id}</TableCell>
                <TableCell>
                  <Image src={item.image} alt={item.jewelry_type} width={40} height={40} className="rounded-md" data-ai-hint={item.hint} />
                </TableCell>
                <TableCell>{item.jewelry_type}</TableCell>
                <TableCell>{item.metal}</TableCell>
                <TableCell>{`${item.diamond_shape} ${item.diamond_carat.toFixed(2)}ct`}</TableCell>
                <TableCell className="text-right">{formatPrice(item.price)}</TableCell>
                <TableCell className="text-right">{item.stock}</TableCell>
                <TableCell className="text-right">
                  <div className="flex gap-2 justify-end">
                    <Button variant="ghost" size="icon"><Edit className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
