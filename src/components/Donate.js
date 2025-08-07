import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
    Elements,
    CardNumberElement,
    CardExpiryElement,
    CardCvcElement,
    useStripe,
    useElements
} from '@stripe/react-stripe-js';
import '../App.css';

/**
 * Test Data
 4242424242424242 - Visa (always succeeds)
 4000000000000002 - Visa (always declined)
 4000000000009995 - Visa (insufficient funds)
 */
// Initialize Stripe (put your publishable key here)
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

// Individual element options
const elementOptions = {
    style: {
        base: {
            fontSize: '16px',
            color: '#424770',
            fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
            fontSmoothing: 'antialiased',
            '::placeholder': {
                color: '#aab7c4',
            },
        },
        invalid: {
            color: '#9e2146',
            iconColor: '#9e2146',
        },
        complete: {
            color: '#4f46e5',
        },
    },
};

function DonateForm() {
    const stripe = useStripe();
    const elements = useElements();

    const [selectedAmount, setSelectedAmount] = useState(5.00);
    const [showCustomInput, setShowCustomInput] = useState(false);
    const [customAmount, setCustomAmount] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [message, setMessage] = useState('');
    const [clientSecret, setClientSecret] = useState('');
    const [showPaymentForm, setShowPaymentForm] = useState(false);
    const [customerName, setCustomerName] = useState('');
    const [customerEmail, setCustomerEmail] = useState('');

    const handleSuggestedAmount = () => {
        setSelectedAmount(5.00);
        setShowCustomInput(false);
        setCustomAmount('');
        setShowPaymentForm(false);
        setClientSecret('');
        setMessage('');
    };

    const handleCustomToggle = () => {
        setShowCustomInput(true);
        setSelectedAmount(parseFloat(customAmount) || 5.00);
        setShowPaymentForm(false);
        setClientSecret('');
        setMessage('');
    };

    const handleCustomAmountChange = (e) => {
        const value = e.target.value;
        setCustomAmount(value);
        setSelectedAmount(parseFloat(value) || 5.00);
    };

    const createPaymentIntent = async () => {
        setIsProcessing(true);
        setMessage('');

        try {
            const response = await fetch(process.env.REACT_APP_DONATE_CREATE_PAYMENT_INTENT_API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount: Math.round(selectedAmount * 100), // Convert to cents
                    customer_name: customerName,
                    customer_email: customerEmail
                })
            });

            const data = await response.json();

            if (response.ok) {
                setClientSecret(data.clientSecret);
                setShowPaymentForm(true);
                setMessage('');
            } else {
                setMessage(`Error: ${data.error}`);
            }
        } catch (error) {
            setMessage(`Network error: ${error.message}`);
        }

        setIsProcessing(false);
    };

    const handlePayment = async (event) => {
        event.preventDefault();

        if (!stripe || !elements) {
            setMessage('Stripe has not loaded yet. Please try again.');
            return;
        }

        // Use CardNumberElement instead of CardElement
        const cardElement = elements.getElement(CardNumberElement);

        if (!cardElement) {
            setMessage('Card element not found.');
            return;
        }

        setIsProcessing(true);
        setMessage('');

        try {
            // Confirm the payment with the card element
            const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
                payment_method: {
                    card: cardElement,
                    billing_details: {
                        name: customerName,
                        email: customerEmail,
                    },
                },
            });

            if (error) {
                setMessage(`Payment failed: ${error.message}`);
            } else if (paymentIntent && paymentIntent.status === 'succeeded') {
                setMessage(`Thank you! Your donation of $${selectedAmount.toFixed(2)} was successful!`);
                setShowPaymentForm(false);
                setClientSecret('');

                // Optional: Reset form or redirect user
                // You might want to call a success callback here
                console.log('Payment succeeded:', paymentIntent);
            }
        } catch (error) {
            setMessage(`Payment error: ${error.message}`);
        }

        setIsProcessing(false);
    };

    return (
        <div className="donate-container">
            <div className="donation-form">
                <h3>Support Development and Maintenance</h3>
                <p>The skatecreteordie Skatepark Map launched on iOS on 4/20/2016.
                    I've personally incurred all work and expenses including: apple developer program annual fee, google developer account,
                    university of washington ios developer courses, cloud server instance maintenance and monthly fees, claude subscription, web domain registration & hosting,
                    ios, android, & web development time, park data scrubbing development and input, coordinate, address and photo research,
                    photo submission input, promotion, stickers, etc.. This app will always be free and collect NOTHING from you. Your help is much appreciated.
                    Skate ('Crete) or Die!</p>

                {!showPaymentForm ? (
                    <>
                        <div className="amount-options">
                            <button
                                className={`suggested-amount ${!showCustomInput ? 'active' : ''}`}
                                onClick={handleSuggestedAmount}
                                disabled={isProcessing}
                            >
                                $5.00 (suggested)
                            </button>
                            <button
                                className={`custom-toggle ${showCustomInput ? 'active' : ''}`}
                                onClick={handleCustomToggle}
                                disabled={isProcessing}
                            >
                                Custom Amount
                            </button>
                        </div>

                        {showCustomInput && (
                            <div className="custom-input">
                                <label htmlFor="custom-amount">Custom Amount: $</label>
                                <input
                                    type="number"
                                    id="custom-amount"
                                    value={customAmount}
                                    onChange={handleCustomAmountChange}
                                    min="1"
                                    step="0.01"
                                    placeholder="5.00"
                                    disabled={isProcessing}
                                />
                            </div>
                        )}

                        <div className="amount-display">
                            <p>Donation Amount: <strong>${selectedAmount.toFixed(2)}</strong></p>
                        </div>

                        <div className="customer-info">
                            <div className="customer-field">
                                <label htmlFor="customer-name">Full Name</label>
                                <input
                                    type="text"
                                    id="customer-name"
                                    value={customerName}
                                    onChange={(e) => setCustomerName(e.target.value)}
                                    placeholder="Enter your full name"
                                    disabled={isProcessing}
                                    required
                                />
                            </div>
                            <div className="customer-field">
                                <label htmlFor="customer-email">Email Address</label>
                                <input
                                    type="email"
                                    id="customer-email"
                                    value={customerEmail}
                                    onChange={(e) => setCustomerEmail(e.target.value)}
                                    placeholder="Enter your email"
                                    disabled={isProcessing}
                                    required
                                />
                            </div>
                        </div>

                        <button
                            id="create-payment-btn"
                            onClick={createPaymentIntent}
                            disabled={isProcessing || selectedAmount < 1 || !customerName.trim() || !customerEmail.trim()}
                        >
                            {isProcessing ? 'Processing...' : 'Continue to Payment'}
                        </button>
                    </>
                ) : (
                    <form onSubmit={handlePayment} className="payment-form">
                        <div className="amount-display">
                            <p>Donating: <strong>${selectedAmount.toFixed(2)}</strong></p>
                        </div>

                        <div className="card-elements-container">
                            <div className="card-field full-width">
                                <label>Card Number</label>
                                <CardNumberElement
                                    options={elementOptions}
                                    className="card-input"
                                />
                            </div>

                            <div className="card-row">
                                <div className="card-field">
                                    <label>Expiry Date</label>
                                    <CardExpiryElement
                                        options={elementOptions}
                                        className="card-input"
                                    />
                                </div>
                                <div className="card-field">
                                    <label>CVC</label>
                                    <CardCvcElement
                                        options={elementOptions}
                                        className="card-input"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="payment-buttons">
                            <button
                                type="button"
                                onClick={() => {
                                    setShowPaymentForm(false);
                                    setClientSecret('');
                                }}
                                disabled={isProcessing}
                                className="back-btn"
                            >
                                Back
                            </button>
                            <button
                                type="submit"
                                disabled={isProcessing || !stripe}
                                className="pay-btn"
                            >
                                {isProcessing ? 'Processing Payment...' : `Donate $${selectedAmount.toFixed(2)}`}
                            </button>
                        </div>
                    </form>
                )}

                {message && (
                    <div className={`message ${message.includes('Error') || message.includes('failed') ? 'error' : 'success'}`}>
                        {message}
                    </div>
                )}
            </div>
        </div>
    );
}

// Main component that wraps the form with Stripe Elements provider
function Donate(props) {
    return (
        <Elements stripe={stripePromise}>
            <DonateForm />
        </Elements>
    );
}

export default Donate;