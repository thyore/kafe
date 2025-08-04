import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { SocketService } from 'src/app/services/socket.service';
import { generateUUID } from 'src/app/shared/utils/generateUUID';

@Component({
  selector: 'app-receipt',
  templateUrl: './receipt.component.html',
  styleUrls: ['./receipt.component.scss'],
  imports: [AngularSvgIconModule, CommonModule],
  standalone: true
})
export class ReceiptComponent {

  receiptDetails = signal<any>({});

  constructor(private route: ActivatedRoute, private router: Router, private socketService: SocketService) {
    this.route.queryParams.subscribe(params => {
      if (!params || Object.keys(params).length === 0 || !params['name'] || !params['selectedTable'] || !params['date'] || !params['time']) {
        this.router.navigate(['/booking']);
        return;
      }
      this.receiptDetails.set(params);
      console.log('Receipt details set:', this.receiptDetails());
    });
  }

  bookAnother(): void {
    try {
      this.socketService.emit('getReservations', { requestId: generateUUID() });
      window.location.href = '/booking';
    } catch (error) {
      this.router.navigate(['/booking']);
    }
  }
}
