import { Pipe, PipeTransform } from '@angular/core';
import { DatePipe } from '@angular/common';

type DateFormat = 'short' | 'long' | 'relative' | 'iso';

@Pipe({
  name: 'dateFormat',
  standalone: true
})
export class DateFormatPipe implements PipeTransform {
  private datePipe = new DatePipe('en-US');

  transform(value: string | Date | null | undefined, format: DateFormat = 'short'): string {
    if (!value) {
      return '-';
    }

    const date = typeof value === 'string' ? new Date(value) : value;

    switch (format) {
      case 'short':
        return this.datePipe.transform(date, 'MMM d, y') || '-';
      case 'long':
        return this.datePipe.transform(date, 'EEEE, MMMM d, y') || '-';
      case 'relative':
        return this.getRelativeTime(date);
      case 'iso':
        return date.toISOString();
      default:
        return this.datePipe.transform(date, 'MMM d, y') || '-';
    }
  }

  private getRelativeTime(date: Date): string {
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInSecs = Math.floor(diffInMs / 1000);
    const diffInMins = Math.floor(diffInSecs / 60);
    const diffInHours = Math.floor(diffInMins / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInSecs < 60) {
      return 'Just now';
    } else if (diffInMins < 60) {
      return `${diffInMins} minute${diffInMins > 1 ? 's' : ''} ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    } else if (diffInDays < 7) {
      return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    } else if (diffInDays < 30) {
      const weeks = Math.floor(diffInDays / 7);
      return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
    } else {
      return this.datePipe.transform(date, 'MMM d, y') || '-';
    }
  }
}
