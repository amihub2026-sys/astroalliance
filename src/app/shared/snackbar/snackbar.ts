import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { SnackbarService, SnackbarType } from '../snackbar.service';

@Component({
  selector: 'app-snackbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './snackbar.html',
  styleUrls: ['./snackbar.scss']
})
export class SnackbarComponent implements OnInit, OnDestroy {
  visible = false;
  message = '';
  type: SnackbarType = 'success';

  private sub?: Subscription;
  private timer?: any;

  constructor(private snackbarService: SnackbarService) {}

  ngOnInit(): void {
    this.sub = this.snackbarService.snackbar$.subscribe((data) => {

      this.message = data.message;
      this.type = data.type;
      this.visible = true;

      clearTimeout(this.timer);
      this.timer = setTimeout(() => {
        this.visible = false;
      }, 3000);
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
    clearTimeout(this.timer);
  }
}