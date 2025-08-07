import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
    Elements,
    CardElement,
    useStripe,
    useElements
} from '@stripe/react-stripe-js';
import '../App.css';

// Initialize Stripe (put your publishable key here)
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

// Card styling options
const cardElementOptions = {
    style: {
        base: {
            fontSize: '16px',
            color: '#424770',
            '::placeholder': {
                color: '#aab7c4',
            },
        },
        invalid: {
            color: '#9e2146',
        },
    },
};

function DonateForm() {
    const stripe = useStripe();
    const elements = useElements();

    const [selectedAmount, setSelectedAmount] = useState(1.05);
    const [showCustomInput, setShowCustomInput] = useState(false);
    const [customAmount, setCustomAmount] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [message, setMessage] = useState('');
    const [clientSecret, setClientSecret] = useState('');
    const [showPaymentForm, setShowPaymentForm] = useState(false);

    const handleSuggestedAmount = () => {
        setSelectedAmount(1.05);
        setShowCustomInput(false);
        setCustomAmount('');
        setShowPaymentForm(false);
        setClientSecret('');
        setMessage('');
    };

    const handleCustomToggle = () => {
        setShowCustomInput(true);
        setSelectedAmount(parseFloat(customAmount) || 1.05);
        setShowPaymentForm(false);
        setClientSecret('');
        setMessage('');
    };

    const handleCustomAmountChange = (e) => {
        const value = e.target.value;
        setCustomAmount(value);
        setSelectedAmount(parseFloat(value) || 1.05);
    };

    const createPaymentIntent = async () => {
        setIsProcessing(true);
        setMessage('');

        try {
            const response = await fetch(process.env.REACT_APP_DONATE_CREATE_PAYMENT_INTENT_API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount: Math.round(selectedAmount * 100) // Convert to cents
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

        const cardElement = elements.getElement(CardElement);

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
                        // You can add billing details here if needed
                        // name: 'Customer Name',
                        // email: 'customer@example.com',
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
                <h3>Support Development</h3>

                {!showPaymentForm ? (
                    <>
                        <div className="amount-options">
                            <button
                                className={`suggested-amount ${!showCustomInput ? 'active' : ''}`}
                                onClick={handleSuggestedAmount}
                                disabled={isProcessing}
                            >
                                $1.05 (suggested)
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

                        <button
                            id="create-payment-btn"
                            onClick={createPaymentIntent}
                            disabled={isProcessing || selectedAmount < 1}
                        >
                            {isProcessing ? 'Processing...' : 'Continue to Payment'}
                        </button>
                    </>
                ) : (
                    <form onSubmit={handlePayment} className="payment-form">
                        <div className="amount-display">
                            <p>Donating: <strong>${selectedAmount.toFixed(2)}</strong></p>
                        </div>

                        <div className="card-element-container">
                            <label>Card Information</label>
                            <CardElement
                                options={cardElementOptions}
                                className="card-element"
                            />
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