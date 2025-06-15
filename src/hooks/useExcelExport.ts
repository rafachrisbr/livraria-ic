
import { utils, writeFileXLSX } from 'xlsx';
import { supabase } from '@/integrations/supabase/client';

export const useExcelExport = () => {
  const exportReportsToExcel = async () => {
    try {
      // Buscar dados dos produtos
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('name, product_code, price, stock_quantity, minimum_stock');

      if (productsError) throw productsError;

      // Buscar dados das vendas
      const { data: sales, error: salesError } = await supabase
        .from('sales')
        .select(`
          quantity,
          unit_price,
          total_price,
          payment_method,
          sale_date,
          notes,
          products:product_id (
            name,
            product_code
          )
        `);

      if (salesError) throw salesError;

      // Buscar dados agregados
      const { data: categories, error: categoriesError } = await supabase
        .from('categories')
        .select('name, description');

      if (categoriesError) throw categoriesError;

      // Preparar dados para exportação
      const productsData = products?.map(product => ({
        'Nome': product.name,
        'Código': product.product_code,
        'Preço': product.price,
        'Estoque Atual': product.stock_quantity,
        'Estoque Mínimo': product.minimum_stock,
        'Status Estoque': product.stock_quantity <= product.minimum_stock ? 'Baixo' : 'Normal'
      })) || [];

      const salesData = sales?.map(sale => ({
        'Data': new Date(sale.sale_date).toLocaleDateString('pt-BR'),
        'Produto': sale.products?.name || 'N/A',
        'Código do Produto': sale.products?.product_code || 'N/A',
        'Quantidade': sale.quantity,
        'Preço Unitário': sale.unit_price,
        'Total': sale.total_price,
        'Meio de Pagamento': getPaymentMethodLabel(sale.payment_method),
        'Observações': sale.notes || ''
      })) || [];

      const categoriesData = categories?.map(category => ({
        'Nome': category.name,
        'Descrição': category.description || ''
      })) || [];

      // Agrupar vendas por produto para relatório de produtos mais vendidos
      const productSales = sales?.reduce((acc: Record<string, any>, sale) => {
        const productName = sale.products?.name || 'Produto Desconhecido';
        
        if (!acc[productName]) {
          acc[productName] = {
            'Produto': productName,
            'Quantidade Total Vendida': 0,
            'Receita Total': 0
          };
        }
        
        acc[productName]['Quantidade Total Vendida'] += sale.quantity;
        acc[productName]['Receita Total'] += sale.total_price;
        
        return acc;
      }, {}) || {};

      const productSalesData = Object.values(productSales);

      // Agrupar vendas por método de pagamento
      const paymentMethods = sales?.reduce((acc: Record<string, any>, sale) => {
        const method = getPaymentMethodLabel(sale.payment_method);
        
        if (!acc[method]) {
          acc[method] = {
            'Método de Pagamento': method,
            'Quantidade de Vendas': 0,
            'Valor Total': 0
          };
        }
        
        acc[method]['Quantidade de Vendas'] += 1;
        acc[method]['Valor Total'] += sale.total_price;
        
        return acc;
      }, {}) || {};

      const paymentMethodsData = Object.values(paymentMethods);

      // Criar workbook
      const workbook = utils.book_new();

      // Adicionar planilhas
      const productsSheet = utils.json_to_sheet(productsData);
      const salesSheet = utils.json_to_sheet(salesData);
      const categoriesSheet = utils.json_to_sheet(categoriesData);
      const productSalesSheet = utils.json_to_sheet(productSalesData);
      const paymentMethodsSheet = utils.json_to_sheet(paymentMethodsData);

      utils.book_append_sheet(workbook, productsSheet, 'Produtos');
      utils.book_append_sheet(workbook, salesSheet, 'Vendas');
      utils.book_append_sheet(workbook, categoriesSheet, 'Categorias');
      utils.book_append_sheet(workbook, productSalesSheet, 'Produtos Mais Vendidos');
      utils.book_append_sheet(workbook, paymentMethodsSheet, 'Vendas por Pagamento');

      // Gerar nome do arquivo com data atual
      const now = new Date();
      const fileName = `relatorio_livraria_${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}.xlsx`;

      // Baixar arquivo
      writeFileXLSX(workbook, fileName);

      return true;
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      throw error;
    }
  };

  const getPaymentMethodLabel = (method: string) => {
    const methods = {
      dinheiro: 'Dinheiro',
      cartao_debito: 'Cartão de Débito',
      cartao_credito: 'Cartão de Crédito',
      pix: 'PIX',
      outros: 'Outros'
    };
    return methods[method as keyof typeof methods] || method;
  };

  return {
    exportReportsToExcel
  };
};
