import type { Customer } from "@/lib/customers";
import type { SaleDetail } from "@/lib/sales";

export type SaleCustomerPreview = {
  name: string;
  surname: string;
  phoneNumber: string;
  email: string;
};

export function createEmptySaleCustomerPreview(): SaleCustomerPreview {
  return {
    name: "",
    surname: "",
    phoneNumber: "",
    email: "",
  };
}

export function mapCustomerToSaleCustomerPreview(customer: Customer): SaleCustomerPreview {
  return {
    name: customer.name ?? "",
    surname: customer.surname ?? "",
    phoneNumber: customer.phoneNumber ?? "",
    email: customer.email ?? "",
  };
}

export function mapSaleDetailToCustomerPreview(detail: SaleDetail): SaleCustomerPreview {
  return {
    name: detail.name ?? "",
    surname: detail.surname ?? "",
    phoneNumber: detail.phoneNumber ?? "",
    email: detail.email ?? "",
  };
}
