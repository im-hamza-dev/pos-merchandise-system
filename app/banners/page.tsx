'use client';

import { useState, useEffect } from 'react';
import { useBannersStore } from '@/lib/stores/banners.store';
import { useCatalogStore } from '@/lib/stores/catalog.store';
import { Banner } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';

export default function BannersPage() {
  const { banners, loading, loadBanners, createBanner, updateBanner, deleteBanner } = useBannersStore();
  const { products } = useCatalogStore();
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [newBannerOpen, setNewBannerOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<Banner>>({
    type: 'static',
    headline: '',
    subtext: '',
    image: '',
    active: false,
    priority: 0,
  });

  useEffect(() => {
    loadBanners();
  }, [loadBanners]);

  const promotedProducts = products.filter(p => p.promoted);

  const handleSaveBanner = async () => {
    if (!formData.headline?.trim()) {
      toast.error('Headline is required');
      return;
    }

    if (editingBanner) {
      await updateBanner(editingBanner.id, formData);
      toast.success('Banner updated');
      setEditingBanner(null);
    } else {
      await createBanner({
        type: formData.type || 'static',
        image: formData.image || '',
        headline: formData.headline,
        subtext: formData.subtext,
        ctaLink: formData.ctaLink,
        productIds: formData.productIds,
        active: formData.active ?? false,
        priority: formData.priority ?? 0,
        startDate: formData.startDate,
        endDate: formData.endDate,
      });
      toast.success('Banner created');
      setNewBannerOpen(false);
    }

    setFormData({
      type: 'static',
      headline: '',
      subtext: '',
      image: '',
      active: false,
      priority: 0,
    });
    await loadBanners();
  };

  const openEdit = (banner: Banner) => {
    setEditingBanner(banner);
    setFormData(banner);
  };

  const handleDelete = async (bannerId: string) => {
    if (confirm('Are you sure you want to delete this banner?')) {
      await deleteBanner(bannerId);
      toast.success('Banner deleted');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Banners</h1>
          <p className="text-muted-foreground">Manage front-end visual promotions</p>
        </div>
        <Dialog open={newBannerOpen} onOpenChange={setNewBannerOpen}>
          <DialogTrigger asChild>
            <Button>New Banner</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Banner</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Banner Type *</Label>
                <Select value={formData.type} onValueChange={(value: any) => setFormData({ ...formData, type: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="static">Static Banner</SelectItem>
                    <SelectItem value="product">Product-Based Banner</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Banner Image URL *</Label>
                <Input
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  placeholder="https://..."
                />
              </div>

              <div className="space-y-2">
                <Label>Headline *</Label>
                <Input
                  value={formData.headline}
                  onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Subtext</Label>
                <Textarea
                  value={formData.subtext}
                  onChange={(e) => setFormData({ ...formData, subtext: e.target.value })}
                  rows={2}
                />
              </div>

              {formData.type === 'product' && (
                <div className="space-y-2">
                  <Label>Select Promoted Products</Label>
                  <div className="max-h-[200px] overflow-y-auto border rounded p-2 space-y-2">
                    {promotedProducts.map(product => (
                      <div key={product.id} className="flex items-center space-x-2">
                        <Checkbox
                          checked={formData.productIds?.includes(product.id)}
                          onCheckedChange={(checked) => {
                            const currentIds = formData.productIds || [];
                            setFormData({
                              ...formData,
                              productIds: checked
                                ? [...currentIds, product.id]
                                : currentIds.filter(id => id !== product.id),
                            });
                          }}
                        />
                        <Label className="font-normal">{product.name}</Label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label>CTA Link (Optional)</Label>
                <Input
                  value={formData.ctaLink}
                  onChange={(e) => setFormData({ ...formData, ctaLink: e.target.value })}
                  placeholder="https://..."
                />
              </div>

              <div className="flex items-center justify-between">
                <Label>Active</Label>
                <Switch
                  checked={formData.active}
                  onCheckedChange={(checked) => setFormData({ ...formData, active: checked })}
                />
              </div>

              <Button className="w-full" onClick={handleSaveBanner}>
                Create Banner
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {banners.map(banner => (
          <Card key={banner.id}>
            <div className="relative">
              <img
                src={banner.image}
                alt={banner.headline}
                className="w-full h-48 object-cover rounded-t-lg"
              />
              {banner.active && (
                <Badge className="absolute top-2 right-2">Active</Badge>
              )}
            </div>
            <CardContent className="p-4 space-y-2">
              <h3 className="font-medium">{banner.headline}</h3>
              {banner.subtext && (
                <p className="text-sm text-muted-foreground">{banner.subtext}</p>
              )}
              <div className="flex items-center justify-between">
                <Badge variant="outline">{banner.type}</Badge>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => openEdit(banner)}>
                    Edit
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(banner.id)}>
                    Delete
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
