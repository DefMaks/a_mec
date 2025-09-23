import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule, AlertController, ToastController, LoadingController } from '@ionic/angular';
import { AppGlobalService } from 'src/app/services/app-global.service';
import { SupabaseService } from 'src/app/services/supabase.service';
import { TwigaPaieService, StudentPayment } from 'src/app/services/twiga-paie.service';

interface Student {
  id: number;
  nom: string;
  post_nom: string;
  pseudo: string;
  classe: string;
  niveau: string;
  user_id: string;
  selected?: boolean;
  paymentAmount?: number;
  phone?: string;
}

interface PaymentHistory {
  id: string;
  student_name: string;
  amount: number;
  currency: string;
  status: string;
  order_id: string;
  payment_date: string;
  description: string;
}

@Component({
  selector: 'app-parent-payment',
  templateUrl: './parent-payment.component.html',
  styleUrls: ['./parent-payment.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
})
export class ParentPaymentComponent implements OnInit {
  children: Student[] = [];
  selectedChildren: Student[] = [];
  paymentHistory: PaymentHistory[] = [];
  
  // Payment configuration
  monthlyFee = 5000; // Base monthly fee in XOF
  currency = 'XOF';
  feePercentage = 2.5; // Transaction fee percentage
  
  // UI states
  isLoading = false;
  activeTab = 'payment'; // 'payment' or 'history'
  
  // Payment form
  paymentForm = {
    description: 'Frais scolaires mensuel',
    parentPhone: '',
    paymentMethod: 'single' // 'single' or 'bulk'
  };

  constructor(
    public appGlobal: AppGlobalService,
    private supabase: SupabaseService,
    private twigaPaie: TwigaPaieService,
    private alertController: AlertController,
    private toastController: ToastController,
    private loadingController: LoadingController
  ) {}

  async ngOnInit() {
    await this.loadChildren();
    await this.loadPaymentHistory();
  }

  /**
   * Load payment configuration from database
   */
  async loadPaymentConfiguration() {
    try {
      const { data, error } = await this.supabase.from('payment_config')
        .select('*')
        .eq('active', true)
        .single();

      if (error) {
        console.error('Error loading payment config:', error);
        // Set default values if config not found
        this.monthlyFee = 5000;
        return;
      }

      if (data) {
        this.monthlyFee = data.monthly_fee || 5000;
        this.currency = data.currency || 'XOF';
        this.feePercentage = data.fee_percentage || 2.5;
      }
    } catch (error) {
      console.error('Error in loadPaymentConfiguration:', error);
      // Set default values on error
      this.monthlyFee = 5000;
    }
  }

  /**
   * Load children for the current parent
   */
  async loadChildren() {
    try {
      const { data, error } = await this.supabase.getStudentsByParentId(this.appGlobal.user.id);

      if (error) {
        console.error('Error loading children:', error);
        return;
      }

      this.children = data.map((child: any) => ({
        ...child,
        selected: false,
        paymentAmount: this.monthlyFee,
        phone: this.appGlobal.user.phone1 || '' // Default to parent's phone
      }));

    } catch (error) {
      console.error('Error in loadChildren:', error);
    }
  }

  /**
   * Load payment history
   */
  async loadPaymentHistory() {
    try {
      const { data, error } = await this.supabase.getPaymentHistoryByParentId(this.appGlobal.user.id);

      if (error) {
        console.error('Error loading payment history:', error);
        return;
      }

      this.paymentHistory = data || [];
    } catch (error) {
      console.error('Error in loadPaymentHistory:', error);
    }
  }

  /**
   * Toggle child selection
   */
  toggleChildSelection(child: Student) {
    child.selected = !child.selected;
    this.updateSelectedChildren();
  }

  /**
   * Update selected children array
   */
  updateSelectedChildren() {
    this.selectedChildren = this.children.filter(child => child.selected);
  }

  /**
   * Calculate total payment amount
   */
  getTotalAmount(): number {
    return this.selectedChildren.reduce((total, child) => {
      return total + (child.paymentAmount || 0);
    }, 0);
  }

  /**
   * Calculate fees
   */
  getFees(): number {
    const total = this.getTotalAmount();
    return Math.round(total * (this.feePercentage / 100));
  }

  /**
   * Get total amount including fees
   */
  getTotalWithFees(): number {
    return this.getTotalAmount() + this.getFees();
  }

  /**
   * Process payment for selected children
   */
  async processPayment() {
    if (this.selectedChildren.length === 0) {
      this.showToast('Veuillez sélectionner au moins un enfant', 'warning');
      return;
    }

    if (!this.paymentForm.parentPhone) {
      this.showToast('Veuillez saisir votre numéro de téléphone', 'warning');
      return;
    }

    const loading = await this.loadingController.create({
      message: 'Traitement du paiement...',
      spinner: 'crescent'
    });
    await loading.present();

    try {
      if (this.paymentForm.paymentMethod === 'single' && this.selectedChildren.length === 1) {
        await this.processSinglePayment();
      } else {
        await this.processBulkPayment();
      }
    } catch (error) {
      console.error('Payment processing error:', error);
      this.showToast('Erreur lors du traitement du paiement', 'danger');
    } finally {
      loading.dismiss();
    }
  }

  /**
   * Process single payment
   */
  private async processSinglePayment() {
    const child = this.selectedChildren[0];
    const orderId = this.twigaPaie.generateOrderId('SCHOOL');
    
    const paymentData = {
      customer_phone: this.twigaPaie.formatPhoneNumber(this.paymentForm.parentPhone),
      amount: this.getTotalWithFees().toString(),
      currency: this.currency,
      client_order_id: orderId
    };

    const response = await this.twigaPaie.processSinglePayment(paymentData);
    
    if (response.status === 'success') {
      await this.savePaymentRecord(child, response.order_id || orderId, 'pending');
      this.showToast('Paiement initié avec succès', 'success');
      this.resetForm();
    } else {
      throw new Error(response.message || 'Payment failed');
    }
  }

  /**
   * Process bulk payment
   */
  private async processBulkPayment() {
    const bulkId = this.twigaPaie.generateBulkId('SCHOOL');
    
    const bulkData = {
      currency: this.currency,
      client_bulk_id: bulkId,
      items: this.selectedChildren.map(child => ({
        customer_phone: this.twigaPaie.formatPhoneNumber(this.paymentForm.parentPhone),
        amount: (child.paymentAmount || 0).toString()
      }))
    };

    const response = await this.twigaPaie.processBulkPayment(bulkData);
    
    if (response.status === 'success') {
      // Save individual payment records
      for (const child of this.selectedChildren) {
        await this.savePaymentRecord(child, response.bulk_id || bulkId, 'pending');
      }
      
      this.showToast('Paiements groupés initiés avec succès', 'success');
      this.resetForm();
    } else {
      throw new Error(response.message || 'Bulk payment failed');
    }
  }

  /**
   * Save payment record to database
   */
  private async savePaymentRecord(child: Student, orderId: string, status: string) {
    try {
      const paymentRecord = {
        parent_id: this.appGlobal.user.id,
        child_id: child.user_id,
        student_id: child.id,
        amount: child.paymentAmount,
        currency: this.currency,
        order_id: orderId,
        status: status,
        description: `${this.paymentForm.description} - ${child.nom} ${child.post_nom}`,
        payment_date: new Date().toISOString()
      };

      const { error } = await this.supabase.insertPaymentRecord(paymentRecord);
      if (error) {
        console.error('Error saving payment record:', error);
      }
    } catch (error) {
      console.error('Error in savePaymentRecord:', error);
    }
  }

  /**
   * Check payment status
   */
  async checkPaymentStatus(orderId: string) {
    try {
      const status = await this.twigaPaie.checkPaymentStatus(orderId);
      
      await this.supabase.updatePaymentStatus(orderId, status.status);
    } catch (error) {
      console.error('Error checking payment status:', error);
      this.showToast('Erreur lors de la vérification du statut', 'danger');
    }
  }

  /**
   * Reset form after successful payment
   */
  resetForm() {
    this.children.forEach(child => {
      child.selected = false;
      child.paymentAmount = this.monthlyFee;
    });
    this.selectedChildren = [];
    this.loadPaymentHistory(); // Refresh payment history
  }

  /**
   * Show toast message
   */
  async showToast(message: string, color: string) {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      color,
      position: 'top'
    });
    toast.present();
  }

  /**
   * Show confirmation alert
   */
  async showConfirmationAlert() {
    const alert = await this.alertController.create({
      header: 'Confirmer le paiement',
      message: `
        <p>Montant total: ${this.getTotalAmount().toLocaleString()} ${this.currency}</p>
        <p>Frais: ${this.getFees().toLocaleString()} ${this.currency}</p>
        <p><strong>Total à payer: ${this.getTotalWithFees().toLocaleString()} ${this.currency}</strong></p>
        <p>Nombre d'enfants: ${this.selectedChildren.length}</p>
      `,
      buttons: [
        {
          text: 'Annuler',
          role: 'cancel'
        },
        {
          text: 'Confirmer',
          handler: () => {
            this.processPayment();
          }
        }
      ]
    });

    await alert.present();
  }

  /**
   * Format currency display
   */
  formatCurrency(amount: number): string {
    return `${amount.toLocaleString()} ${this.currency}`;
  }

  /**
   * Get status color for payment history
   */
  getStatusColor(status: string): string {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'success':
        return 'success';
      case 'pending':
        return 'warning';
      case 'failed':
      case 'error':
        return 'danger';
      default:
        return 'medium';
    }
  }
}