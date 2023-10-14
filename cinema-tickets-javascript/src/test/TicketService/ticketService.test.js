import TicketService from '@source/pairtest/TicketService';
import InvalidPurchaseException from '@source/pairtest/lib/InvalidPurchaseException';
import TicketTypeRequest from '@source/pairtest/lib/TicketTypeRequest';

describe('TicketService', () => {
  let ticketService;

  const mockTicketPaymentService = {
    makePayment: jest.fn(),
  };

  const mockSeatReservationService = {
    reserveSeat: jest.fn(),
  };

  beforeAll(() => {
    ticketService = new TicketService();
    ticketService.ticketPaymentService = mockTicketPaymentService;
    ticketService.seatReservationService = mockSeatReservationService;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should throw InvalidPurchaseException when ticket count exceeds 20', () => {
    expect(() => {
      ticketService.purchaseTickets('account123', {
        getNoOfTickets: () => 21,
        getTicketType: () => 'ADULT',
      });
    }).toThrow(InvalidPurchaseException);
  });

  it('should throw InvalidPurchaseException when no adult tickets are purchased', () => {
    expect(() => {
      ticketService.purchaseTickets('account123', {
        getNoOfTickets: () => 2,
        getTicketType: () => 'CHILD',
      });
    }).toThrow(InvalidPurchaseException);
  });

  it('should make a payment and reserve seats when purchase is valid', () => {
    const accountId = 'account123';
    const adultRequest = new TicketTypeRequest('ADULT', 2);
    const childRequest = new TicketTypeRequest('CHILD', 1);

    const ticketTypeRequests = [adultRequest, childRequest];

    ticketService.purchaseTickets(accountId, ...ticketTypeRequests);

    expect(mockTicketPaymentService.makePayment).toHaveBeenCalledWith(
      accountId,
      50
    );
    expect(mockSeatReservationService.reserveSeat).toHaveBeenCalledWith(
      accountId,
      3
    );
  });

  it('should not add a seat or payment for infant tickets', () => {
    const accountId = 'account123';
    const adultRequest = new TicketTypeRequest('ADULT', 3);
    const childRequest = new TicketTypeRequest('CHILD', 2);
    const infantRequest = new TicketTypeRequest('INFANT', 2);

    const ticketTypeRequests = [adultRequest, childRequest, infantRequest];

    ticketService.purchaseTickets(accountId, ...ticketTypeRequests);

    expect(mockTicketPaymentService.makePayment).toHaveBeenCalledWith(
      accountId,
      80
    );
    expect(mockSeatReservationService.reserveSeat).toHaveBeenCalledWith(
      accountId,
      5
    );
  });
});
