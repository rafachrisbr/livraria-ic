
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Calendar } from 'lucide-react';
import { useSupabase } from '@/hooks/useSupabase';
import { useToast } from '@/hooks/use-toast';
import { getBestPromotionalPrice, PromotionalPrice } from '@/utils/promotionUtils';
import { PromotionalPriceDisplay } from '@/components/promotions/PromotionalPriceDisplay';

const saleSchema = z.object({
  product_id: z.string().min(1, 'Selecione um produto'),
  quantity: z.number().min(1, 'Quantidade deve ser maior que 0'),
  payment_method: z.enum(['dinheiro', 'cartao_debito', 'cartao_credito', 'pix', 'outros']),
  credit_type: z.enum(['vista', 'parcelado']).optional(),
  installments: z.number().min(1).max(4).optional(),
  installment_fee: z.number().min(0).max(100).optional(),
  sale_date: z.string().min(1, 'Data é obrigatória'),
  notes: z.string().optional()
}).refine((data) => {
  if (data.payment_method === 'cartao_credito') {
    return data.credit_type !== undefined;
  }
  return true;
}, {
  message: 'Tipo de crédito é obrigatório para cartão de crédito',
  path: ['credit_type']
}).refine((data) => {
  if (data.payment_method === 'cartao_credito' && data.credit_type === 'parcelado') {
    return data.installments !== undefined && data.installments >= 1 && data.installments <= 4;
  }
  return true;
}, {
  message: 'Número de parcelas deve ser entre 1 e 4',
  path: ['installments']
});

interface Product {
  id: string;
  name: string;
  price: number;
  stock_quantity: number;
  product_code: string;
}

interface AddSaleDialogProps {
  onSaleAdded: () => void;
}

export const AddSaleDialog = ({ onSaleAdded }: AddSaleDialogProps) => {
  const [open, setOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [promotionalPrice, setPromotionalPrice] = useState<PromotionalPrice | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCalculatingPrice, setIsCalculatingPrice] = useState(false);
  const { toast } = useToast();
  const supabase = useSupabase();

  const form = useForm<z.infer<typeof saleSchema>>({
    resolver: zodResolver(saleSchema),
    defaultValues: {
      product_id: '',
      quantity: 1,
      payment_method: 'dinheiro',
      credit_type: 'vista',
      installments: 1,
      installment_fee: 0,
      sale_date: new Date().toISOString().split('T')[0],
      notes: ''
    }
  });

  const watchPaymentMethod = form.watch('payment_method');
  const watchCreditType = form.watch('credit_type');
  const watchInstallments = form.watch('installments');
  const watchInstallmentFee = form.watch('installment_fee');

  useEffect(() => {
    if (open) {
      fetchProducts();
    }
  }, [open]);

  // Calcular preço promocional quando produto ou quantidade mudarem
  useEffect(() => {
    if (selectedProduct) {
      calculatePromotionalPrice();
    }
  }, [selectedProduct, form.watch('quantity')]);

  // Resetar campos de crédito quando método de pagamento muda
  useEffect(() => {
    if (watchPaymentMethod !== 'cartao_credito') {
      form.setValue('credit_type', 'vista');
      form.setValue('installments', 1);
      form.setValue('installment_fee', 0);
    }
  }, [watchPaymentMethod, form]);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, price, stock_quantity, product_code')
        .gt('stock_quantity', 0)
        .order('name');

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar produtos',
        variant: 'destructive'
      });
    }
  };

  const calculatePromotionalPrice = async () => {
    if (!selectedProduct) return;

    setIsCalculatingPrice(true);
    try {
      const priceInfo = await getBestPromotionalPrice(selectedProduct.id, selectedProduct.price);
      setPromotionalPrice(priceInfo);
    } catch (error) {
      console.error('Error calculating promotional price:', error);
      // Em caso de erro, usar preço original
      setPromotionalPrice({
        originalPrice: selectedProduct.price,
        promotionalPrice: selectedProduct.price,
        discount: 0,
        hasPromotion: false
      });
    } finally {
      setIsCalculatingPrice(false);
    }
  };

  const calculateInstallmentValue = () => {
    if (!promotionalPrice || !watchInstallments) return 0;
    
    const totalPrice = promotionalPrice.promotionalPrice * form.watch('quantity');
    const feeAmount = totalPrice * ((watchInstallmentFee || 0) / 100);
    const totalWithFee = totalPrice + feeAmount;
    
    return totalWithFee / watchInstallments;
  };

  const onSubmit = async (values: z.infer<typeof saleSchema>) => {
    if (!selectedProduct || !promotionalPrice) return;

    setIsLoading(true);
    try {
      console.log('Iniciando venda:', {
        produto: selectedProduct.name,
        quantidade: values.quantity,
        estoqueAtual: selectedProduct.stock_quantity
      });

      // Verificar se há estoque suficiente
      if (values.quantity > selectedProduct.stock_quantity) {
        toast({
          title: 'Erro',
          description: 'Estoque insuficiente para esta quantidade',
          variant: 'destructive'
        });
        return;
      }

      // Buscar o administrador atual
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: 'Erro',
          description: 'Usuário não autenticado',
          variant: 'destructive'
        });
        return;
      }

      const { data: adminData, error: adminError } = await supabase
        .from('administrators')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (adminError) {
        console.error('Error fetching admin:', adminError);
        toast({
          title: 'Erro',
          description: 'Erro ao buscar dados do administrador',
          variant: 'destructive'
        });
        return;
      }

      // Usar o preço promocional se houver
      const unitPrice = promotionalPrice.promotionalPrice;
      const totalPrice = unitPrice * values.quantity;

      // Calcular valores de parcelamento se necessário
      let installmentValue = null;
      if (values.payment_method === 'cartao_credito' && values.credit_type === 'parcelado') {
        const feeAmount = totalPrice * ((values.installment_fee || 0) / 100);
        const totalWithFee = totalPrice + feeAmount;
        installmentValue = totalWithFee / (values.installments || 1);
      }

      // Criar a venda
      const saleData = {
        product_id: values.product_id,
        administrator_id: adminData.id,
        quantity: values.quantity,
        unit_price: unitPrice,
        total_price: totalPrice,
        payment_method: values.payment_method,
        credit_type: values.payment_method === 'cartao_credito' ? values.credit_type : null,
        installments: values.payment_method === 'cartao_credito' && values.credit_type === 'parcelado' ? values.installments : null,
        installment_fee: values.payment_method === 'cartao_credito' && values.credit_type === 'parcelado' ? values.installment_fee : null,
        installment_value: installmentValue,
        sale_date: values.sale_date,
        notes: values.notes || null,
        promotion_id: promotionalPrice.hasPromotion ? promotionalPrice.promotion?.id : null
      };

      console.log('Dados da venda:', saleData);

      const { error: saleError } = await supabase
        .from('sales')
        .insert(saleData);

      if (saleError) {
        console.error('Error creating sale:', saleError);
        throw saleError;
      }

      console.log('Venda criada com sucesso, atualizando estoque...');

      // Atualizar o estoque do produto
      const newStockQuantity = selectedProduct.stock_quantity - values.quantity;
      
      console.log('Atualizando estoque:', {
        produtoId: values.product_id,
        estoqueAnterior: selectedProduct.stock_quantity,
        quantidadeVendida: values.quantity,
        novoEstoque: newStockQuantity
      });

      const { data: updateData, error: updateError } = await supabase
        .from('products')
        .update({ stock_quantity: newStockQuantity })
        .eq('id', values.product_id)
        .select('stock_quantity');

      if (updateError) {
        console.error('Error updating stock:', updateError);
        toast({
          title: 'Erro Critical',
          description: 'Venda registrada, mas erro ao atualizar estoque! Verifique manualmente.',
          variant: 'destructive'
        });
        return;
      }

      console.log('Estoque atualizado com sucesso:', updateData);

      // Mostrar mensagem de sucesso com informações da promoção e parcelamento
      let successMessage = `Venda registrada! Estoque atualizado: ${newStockQuantity} unidades restantes.`;
      
      if (promotionalPrice.hasPromotion) {
        const totalSavings = (selectedProduct.price - unitPrice) * values.quantity;
        successMessage += ` Desconto aplicado: R$ ${totalSavings.toFixed(2)}`;
      }

      if (values.payment_method === 'cartao_credito' && values.credit_type === 'parcelado') {
        successMessage += ` Parcelado em ${values.installments}x de R$ ${installmentValue?.toFixed(2)}`;
      }

      toast({
        title: 'Sucesso',
        description: successMessage
      });

      form.reset();
      setSelectedProduct(null);
      setPromotionalPrice(null);
      setOpen(false);
      onSaleAdded();
    } catch (error) {
      console.error('Error creating sale:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao registrar venda',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleProductChange = (productId: string) => {
    const product = products.find(p => p.id === productId);
    setSelectedProduct(product || null);
    setPromotionalPrice(null);
    form.setValue('product_id', productId);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-slate-800 hover:bg-slate-900 text-white">
          <Plus className="h-4 w-4 mr-2" />
          Nova Venda
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Registrar Nova Venda</DialogTitle>
          <DialogDescription>
            Registre uma nova venda e atualize o estoque automaticamente. Promoções são aplicadas automaticamente.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="product_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Produto</FormLabel>
                  <Select onValueChange={handleProductChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um produto" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {products.map((product) => (
                        <SelectItem key={product.id} value={product.id}>
                          {product.product_code} - {product.name} (Estoque: {product.stock_quantity})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {selectedProduct && (
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-sm text-slate-600">
                  Preço original: R$ {selectedProduct.price.toFixed(2)}
                </p>
                <p className="text-sm text-slate-600">
                  Estoque disponível: {selectedProduct.stock_quantity} unidades
                </p>
                <p className="text-sm text-slate-600">
                  Estoque após venda: {Math.max(0, selectedProduct.stock_quantity - (form.watch('quantity') || 0))} unidades
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantidade</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        max={selectedProduct?.stock_quantity || 1}
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="sale_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data da Venda</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Exibir informações de preço promocional */}
            {selectedProduct && form.watch('quantity') && (
              <div className="p-3 bg-white border border-slate-200 rounded-lg">
                {isCalculatingPrice ? (
                  <p className="text-sm text-slate-500">Calculando promoções...</p>
                ) : promotionalPrice ? (
                  <PromotionalPriceDisplay 
                    promotionalPrice={promotionalPrice}
                    quantity={form.watch('quantity')}
                  />
                ) : null}
              </div>
            )}

            <FormField
              control={form.control}
              name="payment_method"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Método de Pagamento</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="dinheiro">Dinheiro</SelectItem>
                      <SelectItem value="cartao_debito">Cartão de Débito</SelectItem>
                      <SelectItem value="cartao_credito">Cartão de Crédito</SelectItem>
                      <SelectItem value="pix">PIX</SelectItem>
                      <SelectItem value="outros">Outros</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Campos específicos para cartão de crédito */}
            {watchPaymentMethod === 'cartao_credito' && (
              <div className="space-y-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-medium text-blue-900">Detalhes do Cartão de Crédito</h4>
                
                <FormField
                  control={form.control}
                  name="credit_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de Crédito</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-row space-x-6"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="vista" id="vista" />
                            <Label htmlFor="vista">À Vista</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="parcelado" id="parcelado" />
                            <Label htmlFor="parcelado">Parcelado</Label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {watchCreditType === 'parcelado' && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="installments"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Número de Parcelas</FormLabel>
                            <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="1">1x</SelectItem>
                                <SelectItem value="2">2x</SelectItem>
                                <SelectItem value="3">3x</SelectItem>
                                <SelectItem value="4">4x</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="installment_fee"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Taxa (%)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="0"
                                max="100"
                                step="0.01"
                                placeholder="0.00"
                                {...field}
                                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Preview do parcelamento */}
                    {promotionalPrice && watchInstallments && (
                      <div className="p-3 bg-blue-100 rounded border border-blue-300">
                        <p className="text-sm font-medium text-blue-900">
                          Resumo do Parcelamento:
                        </p>
                        <p className="text-sm text-blue-800">
                          {watchInstallments}x de R$ {calculateInstallmentValue().toFixed(2)}
                          {watchInstallmentFee && watchInstallmentFee > 0 && (
                            <span className="text-blue-600"> (taxa {watchInstallmentFee}%)</span>
                          )}
                        </p>
                        <p className="text-xs text-blue-700">
                          Total: R$ {(calculateInstallmentValue() * (watchInstallments || 1)).toFixed(2)}
                        </p>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observações (opcional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Observações sobre a venda..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={isLoading || !selectedProduct || !promotionalPrice}
              >
                {isLoading ? 'Registrando...' : 'Registrar Venda'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
