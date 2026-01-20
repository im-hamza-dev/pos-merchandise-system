'use client';

import { useState } from 'react';
import { useCatalogStore } from '@/lib/stores/catalog.store';
import { Category } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';

interface CategoriesManagerProps {
  canEdit?: boolean;
}

export function CategoriesManager({ canEdit = true }: CategoriesManagerProps) {
  const { categories, products, updateCategory, createCategory, loadCategories } = useCatalogStore();
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [newCategoryOpen, setNewCategoryOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<Category>>({
    name: '',
    visible: true,
    displayOrder: categories.length + 1,
  });

  const handleSaveCategory = async () => {
    if (!canEdit) return;
    if (!formData.name?.trim()) {
      toast.error('Category name is required');
      return;
    }

    if (editingCategory) {
      await updateCategory(editingCategory.id, formData);
      toast.success('Category updated');
      setEditingCategory(null);
    } else {
      await createCategory({
        name: formData.name!,
        visible: formData.visible ?? true,
        displayOrder: formData.displayOrder ?? categories.length + 1,
      });
      toast.success('Category created');
      setNewCategoryOpen(false);
    }

    setFormData({ name: '', visible: true, displayOrder: categories.length + 1 });
    await loadCategories();
  };

  const getProductCount = (categoryId: string) => {
    return products.filter(p => p.categoryId === categoryId).length;
  };

  const openEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData(category);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Categories ({categories.length})</CardTitle>
            {canEdit && (
              <Dialog open={newCategoryOpen} onOpenChange={setNewCategoryOpen}>
                <DialogTrigger asChild>
                  <Button>New Category</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Category</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Category Name *</Label>
                      <Input
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Enter category name"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>Visible</Label>
                      <Switch
                        checked={formData.visible}
                        onCheckedChange={(checked) => setFormData({ ...formData, visible: checked })}
                      />
                    </div>
                    <Button className="w-full" onClick={handleSaveCategory}>
                      Create Category
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {categories
              .sort((a, b) => a.displayOrder - b.displayOrder)
              .map(category => (
                <div
                  key={category.id}
                  className="flex items-center gap-4 p-4 border rounded hover:border-primary/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{category.name}</h3>
                      {!category.visible && <Badge variant="secondary">Hidden</Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {getProductCount(category.id)} products
                    </p>
                  </div>
                  {canEdit && (
                    <Dialog
                      open={editingCategory?.id === category.id}
                      onOpenChange={(open) => !open && setEditingCategory(null)}
                    >
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" onClick={() => openEdit(category)}>
                          Edit
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Edit Category</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label>Category Name *</Label>
                            <Input
                              value={formData.name}
                              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <Label>Visible</Label>
                              <p className="text-sm text-muted-foreground">
                                Hidden categories and their products won't appear in checkout
                              </p>
                            </div>
                            <Switch
                              checked={formData.visible}
                              onCheckedChange={(checked) => setFormData({ ...formData, visible: checked })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Display Order</Label>
                            <Input
                              type="number"
                              value={formData.displayOrder}
                              onChange={(e) =>
                                setFormData({ ...formData, displayOrder: parseInt(e.target.value) })
                              }
                            />
                          </div>
                          <Button className="w-full" onClick={handleSaveCategory}>
                            Save Changes
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
              ))}
          </div>
        </CardContent>
      </Card>

     
    </div>
  );
}
