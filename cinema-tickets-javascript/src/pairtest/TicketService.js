import InvalidPurchaseException from './lib/InvalidPurchaseException.js';
import TicketPaymentService from '../thirdparty/paymentgateway/TicketPaymentService.js';
import SeatReservationService from '../thirdparty/seatbooking/SeatReservationService.js';

export default class TicketService {
  /**
   * Should only have private methods other than the one below.
   */
  ticketPaymentService;
  seatReservationService;

  constructor() {
    this.ticketPaymentService = new TicketPaymentService();
    this.SeatReservationService = new SeatReservationService();
  }

  purchaseTickets(accountId, ...ticketTypeRequests) {
    let ticketCount = 0;
    let tickets = [];

    for (const request of ticketTypeRequests) {
      const numberOfTickets = request.getNoOfTickets();
      ticketCount += numberOfTickets;
      if (ticketCount > 20) {
        throw new InvalidPurchaseException(
          'number of tickets has exceeded the maximum of 20'
        );
      }
      const type = request.getTicketType();

      const ticketInfo = {
        quantity: numberOfTickets,
        ticketType: type,
      };

      tickets.push(ticketInfo);
    }

    const hasAdultTicket = tickets.some(
      (ticket) => ticket['ticketType'] === 'ADULT'
    );

    if (!hasAdultTicket) {
      throw new InvalidPurchaseException(
        'at least one adult ticket must be purchased'
      );
    }

    const totalToPay = this.calculateTotalToPay(tickets);
    const numberOfSeatsRequired = this.calculateTotalSeatsToAllocate(tickets);

    this.seatReservationService.reserveSeat(accountId, numberOfSeatsRequired);
    this.ticketPaymentService.makePayment(accountId, totalToPay);
  }

  calculateTotalSeatsToAllocate(ticketInfo) {
    let numberOfSeatsRequired = 0;
    for (const info of ticketInfo) {
      if (info.ticketType === 'INFANT') {
        continue;
      }
      numberOfSeatsRequired += info.quantity;
    }
    return numberOfSeatsRequired;
  }

  calculateTotalToPay(ticketInfo) {
    let totalToPay = 0;
    for (const info of ticketInfo) {
      switch (true) {
        case info.ticketType === 'INFANT':
          break;
        case info.ticketType === 'CHILD':
          totalToPay += 10 * info.quantity;
          break;
        case info.ticketType === 'ADULT':
          totalToPay += 20 * info.quantity;
          break;
      }
    }
    return totalToPay;
  }
}
