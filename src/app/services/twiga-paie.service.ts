import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, from } from 'rxjs';
import { environment } from 'src/environments/environment';
import { CapacitorHttp } from '@capacitor/core';

export interface PaymentRequest {
  customer_phone: string;
  amount: string;
  currency: string;
  client_order_id: string;
}

export interface BulkPaymentRequest {
  currency: string;
  client_bulk_id: string;
  items: {
    customer_phone: string;
    amount: string;
  }[];
}

export interface PaymentResponse {
  status: string;
  order_id?: string;
  bulk_id?: string;
  message: string;
  error?: {
    code: string;
    message: string;
  };
}

export interface PaymentStatusResponse {
  status: string;
  order_id: string;
  amount: string;
  currency: string;
  transaction_date: string;
}

export interface StudentPayment {
  student_id: number;
  student_name: string;
  amount: number;
  phone: string;
  description: string;
}

@Injectable({
  providedIn: 'root'
})
export class TwigaPaieService {
  private apiUrl = environment.TWIGA_PAIE_API_URL;
  private apiKey = environment.TWIGA_PAIE_API_KEY;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'X-API-Key': this.apiKey,
      'Content-Type': 'application/json'
    });
  }

  /**
   * Process a single payment
   */
  async processSinglePayment(paymentData: PaymentRequest): Promise<PaymentResponse> {
    const options = {
      url: `${this.apiUrl}/payments/payment-service`,
      headers: {
        'X-API-Key': this.apiKey,
        'Content-Type': 'application/json'
      },
      data: paymentData
    };

    try {
      const response = await CapacitorHttp.post(options);
      return response.data;
    } catch (error) {
      console.error('Payment error:', error);
      throw error;
    }
  }

  /**
   * Process bulk payments for multiple students
   */
  async processBulkPayment(bulkData: BulkPaymentRequest): Promise<PaymentResponse> {
    const options = {
      url: `${this.apiUrl}/bulk-payments/payment-pay-out`,
      headers: {
        'X-API-Key': this.apiKey,
        'Content-Type': 'application/json'
      },
      data: bulkData
    };

    try {
      const response = await CapacitorHttp.post(options);
      return response.data;
    } catch (error) {
      console.error('Bulk payment error:', error);
      throw error;
    }
  }

  /**
   * Check payment status
   */
  async checkPaymentStatus(orderId: string): Promise<PaymentStatusResponse> {
    const options = {
      url: `${this.apiUrl}/payments/payment-check`,
      headers: {
        'X-API-Key': this.apiKey,
        'Content-Type': 'application/json'
      },
      data: { order_id: orderId }
    };

    try {
      const response = await CapacitorHttp.post(options);
      return response.data;
    } catch (error) {
      console.error('Payment status check error:', error);
      throw error;
    }
  }

  /**
   * Check bulk payment status
   */
  async checkBulkPaymentStatus(bulkId: string): Promise<any> {
    const options = {
      url: `${this.apiUrl}/bulk-payments/${bulkId}/details`,
      headers: {
        'X-API-Key': this.apiKey,
        'Content-Type': 'application/json'
      }
    };

    try {
      const response = await CapacitorHttp.get(options);
      return response.data;
    } catch (error) {
      console.error('Bulk payment status check error:', error);
      throw error;
    }
  }

  /**
   * Generate unique order ID
   */
  generateOrderId(prefix: string = 'PAY'): string {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `${prefix}-${timestamp}-${random}`;
  }

  /**
   * Generate unique bulk ID
   */
  generateBulkId(prefix: string = 'BULK'): string {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `${prefix}-${timestamp}-${random}`;
  }

  /**
   * Validate phone number format
   */
  validatePhoneNumber(phone: string): boolean {
    // Check if phone starts with + and has at least 10 digits
    const phoneRegex = /^\+[1-9]\d{8,14}$/;
    return phoneRegex.test(phone);
  }

  /**
   * Format phone number to international format
   */
  formatPhoneNumber(phone: string, countryCode: string = '+243'): string {
    // Remove all non-digit characters
    const cleanPhone = phone.replace(/\D/g, '');
    
    // If phone starts with country code digits, use as is
    if (cleanPhone.startsWith('243')) {
      return '+' + cleanPhone;
    }
    
    // If phone starts with 0, replace with country code
    if (cleanPhone.startsWith('0')) {
      return countryCode + cleanPhone.substring(1);
    }
    
    // Otherwise, add country code
    return countryCode + cleanPhone;
  }

  /**
   * Calculate total amount with fees
   */
  calculateTotalWithFees(amount: number, feePercentage: number = 2.5): {
    originalAmount: number;
    fees: number;
    totalAmount: number;
  } {
    const fees = Math.round(amount * (feePercentage / 100));
    return {
      originalAmount: amount,
      fees: fees,
      totalAmount: amount + fees
    };
  }
}