
-- Adicionar colunas para detalhes de cartão de crédito
ALTER TABLE public.sales 
ADD COLUMN credit_type TEXT CHECK (credit_type IN ('vista', 'parcelado')),
ADD COLUMN installments INTEGER CHECK (installments >= 1 AND installments <= 4),
ADD COLUMN installment_fee NUMERIC(5,2) CHECK (installment_fee >= 0),
ADD COLUMN installment_value NUMERIC(10,2) CHECK (installment_value >= 0);

-- Comentários para documentar as colunas
COMMENT ON COLUMN public.sales.credit_type IS 'Tipo do cartão de crédito: vista ou parcelado';
COMMENT ON COLUMN public.sales.installments IS 'Número de parcelas (1-4)';
COMMENT ON COLUMN public.sales.installment_fee IS 'Taxa aplicada em porcentagem';
COMMENT ON COLUMN public.sales.installment_value IS 'Valor de cada parcela';
