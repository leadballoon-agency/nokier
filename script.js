// Open modal
function openModal() {
    const modal = document.getElementById('modalOverlay');
    modal.classList.remove('hidden');
    setTimeout(() => {
        modal.classList.add('active');
    }, 10);
    document.body.style.overflow = 'hidden';
}

// Close modal
function closeModal() {
    const modal = document.getElementById('modalOverlay');
    modal.classList.remove('active');
    setTimeout(() => {
        modal.classList.add('hidden');
    }, 300);
    document.body.style.overflow = '';
}

// Scroll to signup section from hero CTA
document.getElementById('scrollToSignup')?.addEventListener('click', function(e) {
    e.preventDefault();
    openModal();
});

// Reveal real price on interaction
function revealRealPrice(element) {
    setTimeout(() => {
        openModal();
    }, 400);
}

// Tier Assessment Widget Logic
let currentStepNum = 1;
let assessmentData = {};
let sausageSequence = [];

// Show in-form alert
function showAlert(stepNumber, message) {
    const alert = document.getElementById(`alert-step${stepNumber}`);
    if (alert) {
        alert.querySelector('.alert-message').textContent = message;
        alert.classList.add('show');

        // Auto-hide after 5 seconds
        setTimeout(() => {
            alert.classList.remove('show');
        }, 5000);
    }
}

// Hide alert
function hideAlert(stepNumber) {
    const alert = document.getElementById(`alert-step${stepNumber}`);
    if (alert) {
        alert.classList.remove('show');
    }
}

function nextStep(step) {
    // Validate current step
    if (step === 2) {
        const policy = document.getElementById('widgetPolicy').value;
        if (!policy) {
            showAlert(1, 'Please select your favorite government policy feature');
            return;
        }
        assessmentData.favoritePolicy = policy;
        hideAlert(1);
    }

    if (step === 4) {
        const check1 = document.getElementById('check1').checked;
        const check2 = document.getElementById('check2').checked;
        const check3 = document.getElementById('check3').checked;

        // All checkboxes must be checked to proceed
        if (!check1 || !check2 || !check3) {
            showAlert(3, 'ACHTUNG! All boxes must be checked! Zis is not optional! You vill comply!');
            return;
        }

        assessmentData.compliance = { check1, check2, check3 };
        hideAlert(3);
    }

    // Update share verification display when entering step 5
    if (step === 5) {
        updateModalQueue();
    }

    // Update UI
    document.querySelector('.widget-step.active').classList.remove('active');
    document.querySelector(`[data-step="${step}"]`).classList.add('active');

    currentStepNum = step;
    updateProgress();
}

function updateProgress() {
    const progress = (currentStepNum / 7) * 100;
    document.getElementById('progressBar').style.width = progress + '%';
    document.getElementById('currentStep').textContent = currentStepNum;
}

// Update modal queue display
function updateModalQueue() {
    const penalty = sharesCount * 100;
    const currentWaitlist = getWaitlistCount();

    // Your position would be: current waitlist + 1 (you're new) + share penalty
    const estimatedPosition = currentWaitlist + 1 + penalty;

    const modalQueue = document.getElementById('modalQueueNumber');
    const modalShares = document.getElementById('modalSharesRemaining');

    if (modalQueue) {
        modalQueue.textContent = estimatedPosition.toLocaleString();
    }

    if (modalShares) {
        modalShares.textContent = MAX_SHARES - sharesCount;
    }
}

function selectOption(element, nextStepNum) {
    // Remove previous selection
    element.parentElement.querySelectorAll('.option-card').forEach(card => {
        card.classList.remove('selected');
    });

    // Mark as selected
    element.classList.add('selected');

    // Store data
    assessmentData.income = element.querySelector('.option-label').textContent;

    // Auto advance after short delay
    setTimeout(() => {
        nextStep(nextStepNum);
    }, 500);
}

// Sausage Game Logic
function sausageClick(number) {
    sausageSequence.push(number);
    const btn = document.querySelector(`[data-number="${number}"]`);

    if (sausageSequence.length === 1 && number === 1) {
        btn.classList.add('correct');
        document.getElementById('gameStatus').textContent = 'Good! Now click 2...';
    } else if (sausageSequence.length === 2 && number === 2) {
        btn.classList.add('correct');
        document.getElementById('gameStatus').textContent = 'Perfect! Now click 3...';
    } else if (sausageSequence.length === 3 && number === 3) {
        btn.classList.add('correct');
        document.getElementById('gameStatus').textContent = '🌭 Sausages released! Processing...';
        setTimeout(() => {
            nextStep(5);
            sausageSequence = [];
        }, 1000);
    } else {
        // Wrong order
        btn.classList.add('wrong');
        document.getElementById('gameStatus').textContent = 'Wrong order! Try again from 1...';
        setTimeout(() => {
            document.querySelectorAll('.sausage-btn').forEach(b => {
                b.classList.remove('correct', 'wrong');
            });
            sausageSequence = [];
            document.getElementById('gameStatus').textContent = 'Click the sausages in order: 1, 2, 3';
        }, 1500);
    }
}

// Attempt to toggle locked add-on
function attemptToggleAddon(element) {
    if (element.classList.contains('locked')) {
        showAlert(6, 'NEIN! Zis ist MANDATORY! You cannot proceed vizout ze FREE Speech Upgrade. Zis ist ze LAW!');
        return;
    }
    toggleAddon(element);
}

// Toggle add-on selection
function toggleAddon(element) {
    const checkbox = element.querySelector('input[type="checkbox"]');
    if (checkbox.disabled) return;

    checkbox.checked = !checkbox.checked;

    if (checkbox.checked) {
        element.classList.add('selected');
    } else {
        element.classList.remove('selected');
    }

    updateOrderSummary();
}

function updateOrderSummary() {
    // FREE Speech Upgrade is mandatory, always checked
    const addonLine = document.getElementById('addonSummaryLine');
    const totalPrice = document.getElementById('totalPrice');

    let total = 149 + 2499; // Phone + mandatory upgrade

    addonLine.classList.remove('hidden');
    assessmentData.freeSpeechUpgrade = true;

    totalPrice.textContent = '£' + total.toLocaleString();
}

// Initialize order summary when step 6 loads
document.addEventListener('DOMContentLoaded', function() {
    // Pre-populate the order summary
    setTimeout(() => {
        const orderSummary = document.getElementById('orderSummary');
        if (orderSummary) {
            updateOrderSummary();
        }
    }, 100);
});

function completeAssessment() {
    const email = document.getElementById('widgetEmail').value;

    if (!email || !email.includes('@')) {
        showAlert(7, 'Please enter a valid email address');
        return;
    }

    hideAlert(7);

    assessmentData.email = email;
    assessmentData.timestamp = new Date().toISOString();
    assessmentData.sharesCount = sharesCount; // Track how many times they shared

    // Get current total waitlist count
    let waitlist = JSON.parse(localStorage.getItem('nokierWaitlist') || '[]');
    let totalSignups = waitlist.length;

    // Your position = total signups + 1 (you're the newest) + penalty for shares
    const sharePenalty = sharesCount * 100;
    assessmentData.queueNumber = totalSignups + 1 + sharePenalty;

    // Determine tier (satirical logic)
    let tier = 'TIER 2';
    if (assessmentData.income === 'Inherited Wealth') {
        tier = 'TIER 1';
    } else if (assessmentData.income === 'Heating or Eating') {
        tier = 'TIER 3';
    }
    assessmentData.tier = tier;

    // Save to localStorage
    waitlist.push(assessmentData);
    localStorage.setItem('nokierWaitlist', JSON.stringify(waitlist));

    // Update global counter
    localStorage.setItem('nokierTotalSignups', totalSignups + 1);

    // Send to GHL webhook
    sendToWebhook(assessmentData);

    // Show success
    document.getElementById('tierAssessment').style.display = 'none';
    document.getElementById('successMessage').classList.remove('hidden');
    document.getElementById('tierBadge').textContent = tier;
    document.getElementById('finalQueue').textContent = assessmentData.queueNumber.toLocaleString();

    // Scroll to success in modal
    setTimeout(() => {
        const modalContainer = document.querySelector('.modal-container');
        modalContainer.scrollTop = 0;
    }, 100);
}

// Send data to GHL webhook
function sendToWebhook(data) {
    const webhookUrl = 'https://services.leadconnectorhq.com/hooks/jeP8qYLTGnfE7C0voenO/webhook-trigger/054d81cc-0d2d-42ec-ab25-ec8146f27b89';

    fetch(webhookUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    }).catch(error => {
        console.log('Webhook error:', error);
        // Silently fail - don't interrupt user experience
    });
}

// Get real waitlist count
function getWaitlistCount() {
    let waitlist = JSON.parse(localStorage.getItem('nokierWaitlist') || '[]');
    return waitlist.length;
}

// Update queue number display with real count
function updateQueueNumber() {
    const heroQueueNumber = document.getElementById('heroQueueNumber');
    const shareQueueNumber = document.getElementById('shareQueueNumber');

    // Get real count of people on waitlist
    const realCount = getWaitlistCount();

    // Show real count to demonstrate viral growth
    const displayNumber = realCount.toLocaleString();

    if (heroQueueNumber) heroQueueNumber.textContent = displayNumber;
    if (shareQueueNumber) shareQueueNumber.textContent = displayNumber;
}

// Update queue number every 5 seconds to show real-time growth
setInterval(updateQueueNumber, 5000);

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    updateQueueNumber();
});

// Social share functions with queue jumping
// Use sessionStorage instead of localStorage so it resets on page refresh
let sharesCount = parseInt(sessionStorage.getItem('nokierShares') || '0');
const MAX_SHARES = 3;

// Modal share function (used in Step 5)
function modalShareOn(platform) {
    shareOn(platform);
    // Update the modal display after share
    setTimeout(() => {
        updateModalQueue();
    }, 1500);
}

function shareOn(platform) {
    const url = encodeURIComponent('https://nokier.co.uk/');
    const text = encodeURIComponent('Check out NoKier 2 - The Ultimate Downgrade. Featuring Two-Tier Technology™ 🌭');

    let shareUrl;

    switch(platform) {
        case 'twitter':
            shareUrl = `https://twitter.com/intent/tweet?text=${text}&url=${url}`;
            break;
        case 'facebook':
            shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
            break;
        case 'linkedin':
            shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
            break;
        case 'whatsapp':
            shareUrl = `https://wa.me/?text=${text}%20${url}`;
            break;
    }

    if (shareUrl) {
        window.open(shareUrl, '_blank', 'width=600,height=400');

        // Punish them for sharing (satirically - they go backwards!)
        if (sharesCount < MAX_SHARES) {
            sharesCount++;
            sessionStorage.setItem('nokierShares', sharesCount.toString());

            // Update all queue numbers (moving them BACK)
            setTimeout(() => {
                jumpQueue();
            }, 1000);
        } else {
            setTimeout(() => {
                alert('⚠️ Share limit reached.\n\nYour position cannot get any worse from additional shares.\n\nFinal position: ' + (47832 + (sharesCount * 100)).toLocaleString());
            }, 500);
        }
    }
}

function jumpQueue() {
    const penalty = sharesCount * 100; // Penalty: 100 positions per share!
    const currentWaitlist = getWaitlistCount();
    const newPosition = currentWaitlist + 1 + penalty; // Your position gets worse

    // Update all queue number displays
    const queueElements = [
        document.getElementById('heroQueueNumber'),
        document.getElementById('shareQueueNumber')
    ];

    // Update hero/share displays to show total waitlist
    queueElements.forEach(el => {
        if (el) {
            el.textContent = currentWaitlist.toLocaleString();
        }
    });

    // Also update modal queue to show YOUR position (with penalty)
    const modalQueue = document.getElementById('modalQueueNumber');
    if (modalQueue) {
        modalQueue.style.transition = 'all 0.5s ease';
        modalQueue.style.transform = 'scale(1.2)';
        modalQueue.style.color = '#dc2626'; // Red to show it got worse

        setTimeout(() => {
            modalQueue.textContent = newPosition.toLocaleString();
        }, 250);

        setTimeout(() => {
            modalQueue.style.transform = 'scale(1)';
            modalQueue.style.color = 'var(--nokia-blue)';
        }, 800);
    }

    // Update shares remaining
    const modalShares = document.getElementById('modalSharesRemaining');
    if (modalShares) {
        modalShares.textContent = MAX_SHARES - sharesCount;
    }

    // Show in-modal notification about position change
    const remaining = MAX_SHARES - sharesCount;
    if (remaining > 0) {
        showAlert(5, `Share recorded! Waitlist size: ${currentWaitlist.toLocaleString()} people. Your estimated position: ${newPosition.toLocaleString()} (includes +${penalty} adjustment for ${sharesCount} share${sharesCount > 1 ? 's' : ''}). Remaining shares: ${remaining}`);
    } else {
        showAlert(5, `Maximum engagement limit reached! Waitlist: ${currentWaitlist.toLocaleString()} people. Your final position: ${newPosition.toLocaleString()} (includes +${penalty} adjustment). Thank you for your participation.`);
    }
}

// Initialize share queue number
document.addEventListener('DOMContentLoaded', function() {
    if (sharesCount > 0) {
        jumpQueue();
    }
});

// Add subtle scroll animations for feature cards
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '0';
            entry.target.style.transform = 'translateY(20px)';
            entry.target.style.transition = 'opacity 0.6s ease, transform 0.6s ease';

            setTimeout(() => {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }, 100);

            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Observe all feature cards
document.addEventListener('DOMContentLoaded', () => {
    const featureCards = document.querySelectorAll('.feature-card');
    featureCards.forEach(card => observer.observe(card));
});

// Easter egg: Click the background phone image multiple times
let clickCount = 0;
const phoneImage = document.querySelector('.hero-bg-image') || document.querySelector('.phone-image-full') || document.querySelector('.phone-image');
if (phoneImage) {
    phoneImage.addEventListener('click', function() {
        clickCount++;
        if (clickCount === 5) {
            alert('🌭 Achievement Unlocked: You released the sausages! 🌭');
            clickCount = 0;
        }
    });
}
