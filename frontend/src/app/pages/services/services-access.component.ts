import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-services-access',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './services-access.component.html',
  styleUrls: ['./services-access.component.scss']
})
export class ServicesAccessComponent implements OnInit {
  returnUrl: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
  }

  goToLogin(): void {
    const queryParams = this.returnUrl ? { returnUrl: this.returnUrl } : {};
    this.router.navigate(['/auth/login'], { queryParams });
  }

  goHome(): void {
    this.router.navigate(['/']);
  }
}

