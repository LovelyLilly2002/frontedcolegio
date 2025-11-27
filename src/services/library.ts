import { type User } from './auth';

export interface Book {
    id: string;
    title: string;
    author: string;
    isbn: string;
    quantity: number;
}

export interface Loan {
    id: string;
    bookId: string;
    userId: string;
    borrowerName: string;
    quantity: number;
    loanDate: string;
    returnDate?: string;
    status: 'Active' | 'Returned' | 'Pending' | 'Rejected';
    bookTitle: string;
}

const BOOKS_KEY = 'colegio_books';
const LOANS_KEY = 'colegio_loans';

// Initial Mock Data
const INITIAL_BOOKS: Book[] = [
    { id: '1', title: 'Cien años de soledad', author: 'Gabriel García Márquez', isbn: '978-0307474728', quantity: 5 },
    { id: '2', title: 'Don Quijote de la Mancha', author: 'Miguel de Cervantes', isbn: '978-8420412146', quantity: 3 },
    { id: '3', title: 'La ciudad y los perros', author: 'Mario Vargas Llosa', isbn: '978-8466333924', quantity: 4 },
    { id: '4', title: 'El principito', author: 'Antoine de Saint-Exupéry', isbn: '978-0156013925', quantity: 10 },
];

export const libraryService = {
    getBooks: (): Book[] => {
        const booksStr = localStorage.getItem(BOOKS_KEY);
        if (!booksStr) {
            localStorage.setItem(BOOKS_KEY, JSON.stringify(INITIAL_BOOKS));
            return INITIAL_BOOKS;
        }
        return JSON.parse(booksStr);
    },

    getLoans: (): Loan[] => {
        const loansStr = localStorage.getItem(LOANS_KEY);
        return loansStr ? JSON.parse(loansStr) : [];
    },

    getUserLoans: (userId: string): Loan[] => {
        const loans = libraryService.getLoans();
        return loans.filter(l => l.userId === userId);
    },

    requestLoan: (bookId: string, user: User): Promise<void> => {
        return new Promise((resolve, reject) => {
            const books = libraryService.getBooks();
            const book = books.find(b => b.id === bookId);

            if (!book) {
                reject(new Error('Libro no encontrado'));
                return;
            }

            if (book.quantity <= 0) {
                reject(new Error('No hay stock disponible para solicitar este libro'));
                return;
            }

            const loans = libraryService.getLoans();
            const newLoan: Loan = {
                id: Date.now().toString(),
                bookId,
                userId: user.username,
                borrowerName: `${user.name} ${user.surname}`,
                quantity: 1,
                loanDate: new Date().toISOString(),
                status: 'Pending',
                bookTitle: book.title
            };

            loans.push(newLoan);
            localStorage.setItem(LOANS_KEY, JSON.stringify(loans));
            resolve();
        });
    },

    approveLoan: (loanId: string): Promise<void> => {
        return new Promise((resolve, reject) => {
            const loans = libraryService.getLoans();
            const loanIndex = loans.findIndex(l => l.id === loanId);

            if (loanIndex === -1) {
                reject(new Error('Solicitud no encontrada'));
                return;
            }

            const loan = loans[loanIndex];
            if (loan.status !== 'Pending') {
                reject(new Error('La solicitud no está pendiente'));
                return;
            }

            const books = libraryService.getBooks();
            const bookIndex = books.findIndex(b => b.id === loan.bookId);

            if (bookIndex === -1) {
                reject(new Error('Libro no encontrado'));
                return;
            }

            if (books[bookIndex].quantity < loan.quantity) {
                reject(new Error('No hay stock suficiente para aprobar el préstamo'));
                return;
            }

            // Approve: Decrease stock and update status
            books[bookIndex].quantity -= loan.quantity;
            loan.status = 'Active';
            loan.loanDate = new Date().toISOString(); // Update date to approval time

            loans[loanIndex] = loan;
            localStorage.setItem(BOOKS_KEY, JSON.stringify(books));
            localStorage.setItem(LOANS_KEY, JSON.stringify(loans));
            resolve();
        });
    },

    rejectLoan: (loanId: string): Promise<void> => {
        return new Promise((resolve, reject) => {
            const loans = libraryService.getLoans();
            const loanIndex = loans.findIndex(l => l.id === loanId);

            if (loanIndex === -1) {
                reject(new Error('Solicitud no encontrada'));
                return;
            }

            const loan = loans[loanIndex];
            if (loan.status !== 'Pending') {
                reject(new Error('La solicitud no está pendiente'));
                return;
            }

            loan.status = 'Rejected';
            loans[loanIndex] = loan;
            localStorage.setItem(LOANS_KEY, JSON.stringify(loans));
            resolve();
        });
    },

    borrowBook: (bookId: string, borrowerName: string, quantity: number, librarianUser: User): Promise<void> => {
        return new Promise((resolve, reject) => {
            const books = libraryService.getBooks();
            const bookIndex = books.findIndex(b => b.id === bookId);

            if (bookIndex === -1) {
                reject(new Error('Libro no encontrado'));
                return;
            }

            if (books[bookIndex].quantity < quantity) {
                reject(new Error('No hay suficientes ejemplares disponibles'));
                return;
            }

            // Update book quantity
            books[bookIndex].quantity -= quantity;
            localStorage.setItem(BOOKS_KEY, JSON.stringify(books));

            // Create Loan record
            const loans = libraryService.getLoans();
            const newLoan: Loan = {
                id: Date.now().toString(),
                bookId,
                userId: librarianUser.username,
                borrowerName,
                quantity,
                loanDate: new Date().toISOString(),
                status: 'Active',
                bookTitle: books[bookIndex].title
            };

            loans.push(newLoan);
            localStorage.setItem(LOANS_KEY, JSON.stringify(loans));
            resolve();
        });
    },

    returnBook: (loanId: string): Promise<void> => {
        return new Promise((resolve, reject) => {
            const loans = libraryService.getLoans();
            const loanIndex = loans.findIndex(l => l.id === loanId);

            if (loanIndex === -1) {
                reject(new Error('Préstamo no encontrado'));
                return;
            }

            const loan = loans[loanIndex];
            if (loan.status === 'Returned') {
                reject(new Error('Este préstamo ya fue devuelto'));
                return;
            }

            // Update Loan status
            loan.status = 'Returned';
            loan.returnDate = new Date().toISOString();
            loans[loanIndex] = loan;
            localStorage.setItem(LOANS_KEY, JSON.stringify(loans));

            // Restore book quantity
            const books = libraryService.getBooks();
            const bookIndex = books.findIndex(b => b.id === loan.bookId);
            if (bookIndex !== -1) {
                books[bookIndex].quantity += loan.quantity;
                localStorage.setItem(BOOKS_KEY, JSON.stringify(books));
            }

            resolve();
        });
    }
};
