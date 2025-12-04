$(document).ready(function(){
    $(window).scroll(function(){
        // sticky navbar on scroll script
        if(this.scrollY > 20){
            $('.navbar').addClass("sticky");
        }else{
            $('.navbar').removeClass("sticky");
        }
        
        // scroll-up button show/hide script
        if(this.scrollY > 500){
            $('.scroll-up-btn').addClass("show");
        }else{
            $('.scroll-up-btn').removeClass("show");
        }
    });

    // slide-up script
    $('.scroll-up-btn').click(function(){
        $('html').animate({scrollTop: 0});
        // removing smooth scroll on slide-up button click
        $('html').css("scrollBehavior", "auto");
    });

    $('.navbar .menu li a').click(function(){
        // applying again smooth scroll on menu items click
        $('html').css("scrollBehavior", "smooth");
    });

    // toggle menu/navbar script
    $('.menu-btn').click(function(){
        $('.navbar .menu').toggleClass("active");
        $('.menu-btn i').toggleClass("active");
    });

    // typing text animation script
    var typed = new Typed(".typing", {
        strings: [ "Student", "Programmer", "Web Developer", " Web Designer", "Gamer"],
        typeSpeed: 100,
        backSpeed: 60,
        loop: true
    });

    var typed = new Typed(".typing-2", {
        strings: ["Student", "Programmer", "Web Developer", " Web Designer", "Gamer"],
        typeSpeed: 100,
        backSpeed: 60,
        loop: true
    });

    // owl carousel script
    $('.carousel').owlCarousel({
        margin: 20,
        loop: true,
        autoplay: true,
        autoplayTimeOut: 2000,
        autoplayHoverPause: true,
        responsive: {
            0:{
                items: 1,
                nav: false
            },
            600:{
                items: 2,
                nav: false
            },
            1000:{
                items: 3,
                nav: false
            }
        }
    });
});

const circles = document.querySelectorAll(".circle");
circles.forEach((elem) => {
    var dots = elem.getAttribute("data-dots");
    var marked = elem.getAttribute("data-percent");
    var percent = Math.floor(dots * marked / 100);
    var points = "";
    var rotate = 360 / dots;

    for (let i = 0; i < dots; i++) {
        points += `<div class="points" style="--i:${i}; --rot:${rotate}deg"></div>`;
    }
    elem.innerHTML = points;

    const pointsMarked = elem.querySelectorAll(".points");
    for (let i = 0; i < percent; i++) {
        pointsMarked[i].classList.add("marked");
    }
});

// Qualification:
const modalViews = document.querySelectorAll(".services__modal"),
  modalBtns = document.querySelectorAll(".services__button"),
  modalCloses = document.querySelectorAll(".services__modal-close");

let modal = function (modalClick) {
  modalViews[modalClick].classList.add("active-modal");
};

modalBtns.forEach((modalBtn, i) => {
  modalBtn.addEventListener("click", () => {
    modal(i);
  });
});

modalCloses.forEach((modalClose) => {
  modalClose.addEventListener("click", () => {
    modalViews.forEach((modalView) => {
      modalView.classList.remove("active-modal");
    });
  });
});

// Project Section:
let currentSlideIndex = 0;
let cardsPerRow = 3;

function showSlides() {
    const cards = document.querySelectorAll('.project-content .card');
    const totalSlides = cards.length;

    // Hide all cards initially
    cards.forEach((card) => {
        card.style.display = 'none';
    });

    // Show only the current set of 3 cards
    for (let i = currentSlideIndex; i < currentSlideIndex + cardsPerRow; i++) {
        if (i < totalSlides) {
            cards[i].style.display = 'block';
        }
    }
}

function moveSlide(direction) {
    const cards = document.querySelectorAll('.project-content .card');
    const totalSlides = cards.length;

    currentSlideIndex += direction;

    // Wrap around when reaching the start or end
    if (currentSlideIndex < 0) {
        currentSlideIndex = totalSlides - cardsPerRow;
    } else if (currentSlideIndex >= totalSlides - cardsPerRow + 1) {
        currentSlideIndex = 0;
    }

    showSlides();
}

function shuffleSlides() {
    const cardsContainer = document.querySelector('.project-content');
    const cards = Array.from(cardsContainer.children);

    // Shuffle cards array
    for (let i = cards.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [cards[i], cards[j]] = [cards[j], cards[i]];
    }

    // Append shuffled cards back to container
    cards.forEach((card) => cardsContainer.appendChild(card));

    showSlides();
}

window.onload = function() {
    showSlides();

    // Auto shuffle every 5 seconds without changing the visible cards
    setInterval(() => {
        shuffleSlides();
    }, 5000);
};

// For Contact section:
document.addEventListener("DOMContentLoaded", function() {
    const today = new Date();
    const maxDate = new Date();
    maxDate.setDate(today.getDate() + 10);

    const formattedToday = today.toISOString().split('T')[0];
    const formattedMaxDate = maxDate.toISOString().split('T')[0];

    document.querySelector('input[name="Day"]').setAttribute('min', formattedToday);
    document.querySelector('input[name="Day"]').setAttribute('max', formattedMaxDate);
});

document.querySelector('textarea[name="Message"]').addEventListener('input', function() {
    this.style.height = 'auto'; // Reset the height
    this.style.height = this.scrollHeight + 'px'; // Adjust the height based on the content
});


// Send Message:
// Send Message:
document.getElementById('contact-form').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent form from submitting the traditional way

    const formData = new FormData(this);

    // Send data to Google Sheets, including the file
    fetch('https://script.google.com/macros/s/AKfycbyj8StS-F7MFYo9xdxvJ1VP0ryEWxSMwd-Nh9pbQXeJFXuM-a9hKoROcWaD8aRPb8nZ/exec', {
        method: 'POST',
        body: formData, // Send FormData directly
    })
    .then(response => response.json()) // Parse the JSON response
    .then(result => {
        if (result.result === 'success') {
            showPopup('Message sent successfully!', false);
        } else if (result.result === 'fail') {
            showPopup('Weekly message limit reached. Try again next week.', true);
        } else {
            showPopup('Failed to send message. Please try again.', true);
        }
    })
    .catch(() => {
        showPopup('An error occurred. Please try again later.', true);
    });
});

// Message status:
function showPopup(message, isError) {
    // Create the popup container
    const popup = document.createElement('div');
    popup.className = `popup ${isError ? 'error' : 'success'}`;
    
    // Create the message element
    const messageElement = document.createElement('p');
    messageElement.textContent = message;
    popup.appendChild(messageElement);
    
    // Create a button container
    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'popup-buttons';

    // Create the "Close" button
    const closeButton = document.createElement('button');
    closeButton.textContent = 'Close';
    closeButton.className = 'popup-close';
    closeButton.addEventListener('click', () => {
        document.body.removeChild(popup);
    });
    buttonContainer.appendChild(closeButton);

    // Create the "Send Again" button
    const sendAgainButton = document.createElement('button');
    sendAgainButton.textContent = 'Send Again';
    sendAgainButton.className = 'popup-send-again';
    sendAgainButton.addEventListener('click', () => {
        document.body.removeChild(popup);
        // Optionally, you could reset the form here if desired
        document.getElementById('contact-form').reset();
    });
    buttonContainer.appendChild(sendAgainButton);

    popup.appendChild(buttonContainer);
    document.body.appendChild(popup);
}
