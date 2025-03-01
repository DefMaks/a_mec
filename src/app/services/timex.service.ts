import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class TimexService {
  startingTime: any;

  constructor() {}

  start(updater: (value: number) => void, amount: number) {
    let elapsedTime = 0; // Initialize elapsed time

    this.startingTime = setInterval(() => {
      elapsedTime += amount; // Increment elapsed time
      updater(elapsedTime); // Call the updater function with the new elapsed time
    }, amount);
  }

  end() {
    clearInterval(this.startingTime);
  }
}
