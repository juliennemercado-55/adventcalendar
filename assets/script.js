(function(){
  // Loading screen animation
  const loadingScreen = document.getElementById('loadingScreen');
  const loadingProgress = document.getElementById('loadingProgress');
  const loadingPercentage = document.getElementById('loadingPercentage');
  const allDecorations = document.querySelectorAll('.ornament, .tree-star');
  const sortedDecorations = Array.from(allDecorations).sort((a, b) => {
    return parseInt(a.dataset.order || 0) - parseInt(b.dataset.order || 0);
  });
  
  let progress = 0;
  const loadingInterval = setInterval(() => {
    progress += Math.random() * 12;
    if (progress > 100) progress = 100;
    
    loadingProgress.style.width = progress + '%';
    loadingPercentage.textContent = Math.floor(progress) + '%';
    
    // Show decorations progressively in order
    const decorationIndex = Math.floor((progress / 100) * sortedDecorations.length);
    for (let i = 0; i < decorationIndex; i++) {
      sortedDecorations[i].style.opacity = '1';
      sortedDecorations[i].style.animation = 'ornamentPop 0.4s ease';
    }
    
    if (progress >= 100) {
      clearInterval(loadingInterval);
      setTimeout(() => {
        loadingScreen.classList.add('fade-out');
        setTimeout(() => {
          loadingScreen.remove();
        }, 500);
      }, 500);
    }
  }, 200);

  const calendarEl = document.getElementById('calendar');
  const modalEl = document.getElementById('modal');
  const modalBodyEl = document.getElementById('modalBody');
  const modalCloseEl = document.getElementById('modalClose');
  const loginSection = document.getElementById('login');
  const loginForm = document.getElementById('loginForm');
  const usernameEl = document.getElementById('username');
  const passcodeEl = document.getElementById('passcode');
  const userInfoEl = document.getElementById('userInfo');
  const currentUserLabelEl = document.getElementById('currentUserLabel');
  const logoutBtn = document.getElementById('logoutBtn');

  const STORAGE_KEY = 'advent.opened.2025';
  const USER_KEY = 'advent.user.2025';
  
  const PASSCODES = {
    julliana: 'brionski',
    russell: 'psychkid',
    zaira: 'dndzaiwa',
  };
  const today = new Date();
  const currentYear = today.getFullYear();
  const isDecember = today.getMonth() === 11; // 0-index: 11 => December
  const currentDay = today.getDate();

  let opened = new Set(JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'));
  let daysData = [];
  let currentUser = localStorage.getItem(USER_KEY) || null;
  
  // Clear box selection for Julliana
  if (currentUser === 'julliana') {
    localStorage.removeItem('box-julliana');
  }

  function saveOpened() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(opened)));
  }

  function doorState(dayNumber) {
    if (opened.has(dayNumber)) return 'opened';
    const unlocked = isDecember && dayNumber <= currentDay;
    return unlocked ? 'unlocked' : 'locked';
  }

  function render() {
    calendarEl.innerHTML = '';
    // Predefined mosaic sizes with special tiles on days 6, 12, 24
    const sizes = [
      'size-1','size-2w','size-1','size-1','size-2h','size-4',
      'size-1','size-2w','size-1','size-1','size-2h','size-4',
      'size-1','size-2w','size-1','size-1','size-2h','size-1',
      'size-1','size-1','size-2h','size-1','size-1','size-4',
      'size-2w'
    ];
    // Shuffled order of days (randomized arrangement)
    const dayOrder = [15, 9, 6, 19, 24, 17, 23, 20, 7, 10, 13, 21, 12, 4, 18, 2, 16, 22, 14, 1, 11, 5, 3, 8, 25];
    
    dayOrder.forEach((dayNumber, idx) => {
      const day = daysData[dayNumber - 1];
      const state = doorState(dayNumber);
      const door = document.createElement('button');
      const sizeClass = sizes[idx % sizes.length];
      door.className = `door ${state} ${sizeClass}`;
      door.style.setProperty('--index', idx);
      door.setAttribute('aria-label', `Day ${dayNumber}: ${day.title || 'Surprise'}`);
      
      door.innerHTML = `
        <span class="badge ${state}">${state}</span>
        <span class="door-number">${dayNumber}</span>
        <h3 class="door-title">${day.title || 'Surprise'}</h3>
      `;
      door.addEventListener('click', () => onDoorClick(dayNumber, day));
      calendarEl.appendChild(door);
    });
  }

  function onDoorClick(dayNumber, day) {
    const state = doorState(dayNumber);
    if (state === 'locked') {
      showLockedMessage(dayNumber);
      return;
    }
    opened.add(dayNumber);
    saveOpened();
    openModal(day);
    triggerConfetti();
    // Add a temporary open animation class to the clicked door
    const doors = calendarEl.querySelectorAll('.door');
    const doorEl = doors[dayNumber - 1];
    if (doorEl) {
      doorEl.classList.add('open-anim');
      setTimeout(() => doorEl.classList.remove('open-anim'), 500);
    }
    render();
  }

  function openModal(day) {
    modalBodyEl.innerHTML = '';
    const title = document.createElement('h2');
    title.textContent = day.title || `Day ${day.day || ''}`;
    
    // Check if this is an envelope/affirmation card
    const isEnvelopeCard = day.title && day.title.toLowerCase().includes('word of affirmation') && 
                          day.image && day.image.includes('envelope');
    
    if (isEnvelopeCard) {
      // Create interactive envelope
      const container = document.createElement('div');
      container.className = 'envelope-container';
      
      const wrapper = document.createElement('div');
      wrapper.className = 'envelope-wrapper';
      
      const envelopeImg = document.createElement('img');
      envelopeImg.src = day.image;
      envelopeImg.alt = 'Envelope';
      envelopeImg.className = 'envelope-svg';
      
      wrapper.appendChild(envelopeImg);
      container.appendChild(wrapper);
      
      modalBodyEl.appendChild(title);
      modalBodyEl.appendChild(container);
      
      // Add click handler to open envelope and show modal
      container.addEventListener('click', () => {
        // Reset and open envelope animation
        wrapper.classList.remove('opening', 'opened');
        void wrapper.offsetWidth; // Trigger reflow to restart animation
        wrapper.classList.add('opening');
        setTimeout(() => {
          wrapper.classList.add('opened');
          showAffirmationModal(day.text || '');
        }, 500);
      });
    } else {
      // Check if this is a fun fact card
      const isFunFactCard = day.title && day.title.toLowerCase().includes('fun fact');
      // Check if this is a reality check card
      const isRealityCheck = day.title && day.title.toLowerCase().includes('reality check');
      // Check if this is a system error card
      const isSystemError = day.title && day.title.toLowerCase().includes('system error');
      // Check if this is a fake announcement card
      const isFakeAnnouncement = day.title && day.title.toLowerCase().includes('important announcement');
      // Check if this is a life hack card
      const isLifeHack = day.title && day.title.toLowerCase().includes('life hack');
      // Check if this is a box pick card
      const isBoxPick = day.title && day.title.toLowerCase().includes('pick a random box');
      // Check if this is a self-care card
      const isSelfCare = day.title && day.title.toLowerCase().includes('self-care prompt');
      // Check if this is a dare card
      const isDare = day.title && day.title.toLowerCase().includes('dare');
      // Check if this is a countdown card
      const isCountdown = day.title && day.title.toLowerCase().includes('countdown');
      // Check if this is a lucky picture card
      const isLuckyPicture = day.title && day.title.toLowerCase().includes('lucky 1x1');
      // Check if this is a wrong advice card
      const isWrongAdvice = day.title && day.title.toLowerCase().includes('wrong advice');
      // Check if this is a useless horoscope card
      const isUselessHoroscope = day.title && day.title.toLowerCase().includes('useless horoscope');
      
      if (isFunFactCard) {
        // Create special fun fact card wrapper
        const funFactContainer = document.createElement('div');
        funFactContainer.className = 'fun-fact-card';
        
        title.className = 'modal-title';
        funFactContainer.appendChild(title);
        
        if (day.image) {
          const img = document.createElement('img');
          img.src = day.image;
          img.alt = day.title || 'Fun fact icon';
          funFactContainer.appendChild(img);
        }
        
        const text = document.createElement('p');
        text.textContent = day.text || '';
        funFactContainer.appendChild(text);
        
        modalBodyEl.appendChild(funFactContainer);
      } else if (isRealityCheck) {
        // Create special reality check card wrapper
        const realityCheckContainer = document.createElement('div');
        realityCheckContainer.className = 'reality-check-card';
        
        title.className = 'modal-title';
        realityCheckContainer.appendChild(title);
        
        const text = document.createElement('p');
        text.textContent = day.text || '';
        realityCheckContainer.appendChild(text);
        
        modalBodyEl.appendChild(realityCheckContainer);
      } else if (isSystemError) {
        // Create special system error card wrapper
        const errorContainer = document.createElement('div');
        errorContainer.className = 'system-error-card';
        
        title.className = 'modal-title';
        errorContainer.appendChild(title);
        
        const text = document.createElement('p');
        text.textContent = day.text || '';
        errorContainer.appendChild(text);
        
        modalBodyEl.appendChild(errorContainer);
      } else if (isFakeAnnouncement) {
        // Create special fake announcement card wrapper
        const announcementContainer = document.createElement('div');
        announcementContainer.className = 'fake-announcement-card';
        
        title.className = 'modal-title';
        announcementContainer.appendChild(title);
        
        const text = document.createElement('p');
        text.textContent = day.text || '';
        announcementContainer.appendChild(text);
        
        modalBodyEl.appendChild(announcementContainer);
      } else if (isLifeHack) {
        // Create special life hack card wrapper with timer
        const lifeHackContainer = document.createElement('div');
        lifeHackContainer.className = 'life-hack-card';
        
        title.className = 'modal-title';
        lifeHackContainer.appendChild(title);
        
        const text = document.createElement('p');
        text.textContent = day.text || '';
        lifeHackContainer.appendChild(text);
        
        // Create timer display
        const timerDisplay = document.createElement('div');
        timerDisplay.className = 'timer-display';
        timerDisplay.textContent = '10';
        lifeHackContainer.appendChild(timerDisplay);
        
        // Create start button
        const startBtn = document.createElement('button');
        startBtn.className = 'timer-button';
        startBtn.textContent = 'Start Timer';
        lifeHackContainer.appendChild(startBtn);
        
        let timerInterval = null;
        let timeLeft = 10;
        
        startBtn.addEventListener('click', () => {
          if (timerInterval) {
            clearInterval(timerInterval);
          }
          
          timeLeft = 10;
          timerDisplay.textContent = timeLeft;
          startBtn.disabled = true;
          startBtn.textContent = 'Staring...';
          
          timerInterval = setInterval(() => {
            timeLeft--;
            timerDisplay.textContent = timeLeft;
            
            if (timeLeft <= 0) {
              clearInterval(timerInterval);
              startBtn.disabled = false;
              startBtn.textContent = 'Try Again';
              timerDisplay.innerHTML = ' Congrats! ';
              triggerConfetti();
              setTimeout(() => {
                timerDisplay.textContent = '10';
              }, 3000);
            }
          }, 1000);
        });
        
        modalBodyEl.appendChild(lifeHackContainer);
      } else if (isBoxPick) {
        // Create box selection card
        const boxContainer = document.createElement('div');
        boxContainer.className = 'box-pick-card';
        
        title.className = 'modal-title';
        boxContainer.appendChild(title);
        
        // Extract main instructions and screenshot instruction
        const fullText = day.text || '';
        const textParts = fullText.split('Screenshot what you got and send it to me.');
        const mainInstructions = textParts[0].trim();
        
        const instructions = document.createElement('p');
        instructions.className = 'box-instructions';
        instructions.textContent = mainInstructions;
        boxContainer.appendChild(instructions);
        
        // Create boxes grid
        const boxesGrid = document.createElement('div');
        boxesGrid.className = 'boxes-grid';
        
        const boxes = ['A', 'B', 'C', 'D', 'E', 'F'];
        let hasChosen = localStorage.getItem(`box-${currentUser}`) ? true : false;
        
        boxes.forEach(box => {
          const boxBtn = document.createElement('button');
          boxBtn.className = 'box-button';
          boxBtn.textContent = box;
          boxBtn.setAttribute('data-box', box);
          
          if (hasChosen) {
            boxBtn.disabled = true;
          }
          
          boxBtn.addEventListener('click', () => {
            // Determine correct box based on user
            const correctBox = {
              'russell': 'B',
              'julliana': 'D',
              'zaira': 'F'
            }[currentUser];
            
            // Save choice
            localStorage.setItem(`box-${currentUser}`, box);
            
            // Disable all buttons
            document.querySelectorAll('.box-button').forEach(btn => {
              btn.disabled = true;
              if (btn.getAttribute('data-box') === correctBox) {
                btn.classList.add('winner');
              } else if (btn.getAttribute('data-box') === box) {
                btn.classList.add('loser');
              }
            });
            
            // Show result
            const resultDiv = document.createElement('div');
            resultDiv.className = 'box-result';
            
            if (box === correctBox) {
              resultDiv.innerHTML = '<h3>WINNER!</h3><p>Free meal claimed! Contact me for your prize.</p>';
              resultDiv.classList.add('win');
              triggerConfetti();
            } else {
              resultDiv.innerHTML = '<h3>Better Luck Next Time</h3><p>The prize was in Box ' + correctBox + '. Try again next year!</p>';
              resultDiv.classList.add('lose');
            }
            
            boxesGrid.parentNode.insertBefore(resultDiv, boxesGrid.nextSibling);
          });
          
          boxesGrid.appendChild(boxBtn);
        });
        
        boxContainer.appendChild(boxesGrid);
        
        // Add screenshot instruction below boxes
        const screenshotInstr = document.createElement('p');
        screenshotInstr.className = 'screenshot-instruction';
        screenshotInstr.textContent = 'Screenshot what you got and send it to me.';
        boxContainer.appendChild(screenshotInstr);
        
        modalBodyEl.appendChild(boxContainer);
      } else if (isSelfCare) {
        // Create special self-care card wrapper
        const selfCareContainer = document.createElement('div');
        selfCareContainer.className = 'self-care-card';
        
        title.className = 'modal-title';
        selfCareContainer.appendChild(title);
        
        const text = document.createElement('p');
        text.textContent = day.text || '';
        selfCareContainer.appendChild(text);
        
        modalBodyEl.appendChild(selfCareContainer);
      } else if (isDare) {
        // Create special dare card wrapper
        const dareContainer = document.createElement('div');
        dareContainer.className = 'dare-card';
        
        title.className = 'modal-title';
        dareContainer.appendChild(title);
        
        const text = document.createElement('p');
        text.textContent = day.text || '';
        dareContainer.appendChild(text);
        
        modalBodyEl.appendChild(dareContainer);
      } else if (isCountdown) {
        // Create special countdown card wrapper
        const countdownContainer = document.createElement('div');
        countdownContainer.className = 'countdown-card';
        
        title.className = 'modal-title';
        countdownContainer.appendChild(title);
        
        // Store the completion message for later
        const completionMessage = day.text || '';
        
        // Create timer display
        const timerDisplay = document.createElement('div');
        timerDisplay.className = 'countdown-display';
        timerDisplay.textContent = '30';
        countdownContainer.appendChild(timerDisplay);
        
        // Create start button
        const startBtn = document.createElement('button');
        startBtn.className = 'countdown-button';
        startBtn.textContent = 'Start Countdown';
        countdownContainer.appendChild(startBtn);
        
        let countdownInterval = null;
        let timeLeft = 30;
        
        startBtn.addEventListener('click', () => {
          if (countdownInterval) {
            clearInterval(countdownInterval);
          }
          
          timeLeft = 30;
          timerDisplay.textContent = timeLeft;
          timerDisplay.style.fontSize = 'clamp(40px, 8vw, 80px)';
          timerDisplay.style.animation = 'countdownPulse 1s ease-in-out infinite';
          startBtn.style.display = 'none';
          
          countdownInterval = setInterval(() => {
            timeLeft--;
            timerDisplay.textContent = timeLeft;
            
            if (timeLeft <= 0) {
              clearInterval(countdownInterval);
              startBtn.style.display = 'block';
              startBtn.textContent = 'Try Again';
              timerDisplay.innerHTML = completionMessage;
              timerDisplay.style.fontSize = 'clamp(20px, 4vw, 28px)';
              timerDisplay.style.animation = 'none';
              triggerConfetti();
            }
          }, 1000);
        });
        
        modalBodyEl.appendChild(countdownContainer);
      } else if (isLuckyPicture) {
        // Create special lucky picture card wrapper
        const luckyContainer = document.createElement('div');
        luckyContainer.className = 'lucky-picture-card';
        
        title.className = 'modal-title';
        luckyContainer.appendChild(title);
        
        const text = document.createElement('p');
        text.textContent = day.text || '';
        luckyContainer.appendChild(text);
        
        if (day.image) {
          const img = document.createElement('img');
          img.src = day.image;
          img.alt = day.title || 'Lucky picture';
          img.className = 'lucky-picture-img';
          luckyContainer.appendChild(img);
        }
        
        // Create save button
        const saveBtn = document.createElement('button');
        saveBtn.className = 'lucky-save-btn';
        saveBtn.textContent = 'Save This Lucky Picture';
        
        saveBtn.addEventListener('click', () => {
          const link = document.createElement('a');
          link.href = day.image;
          link.download = 'lucky1x1.jpg';
          link.click();
          
          // Show confirmation
          const originalText = saveBtn.textContent;
          saveBtn.textContent = '✓ Saved!';
          saveBtn.classList.add('saved');
          setTimeout(() => {
            saveBtn.textContent = originalText;
            saveBtn.classList.remove('saved');
          }, 2000);
        });
        
        luckyContainer.appendChild(saveBtn);
        modalBodyEl.appendChild(luckyContainer);
      } else if (isWrongAdvice) {
        // Create special wrong advice card wrapper
        const wrongAdviceContainer = document.createElement('div');
        wrongAdviceContainer.className = 'wrong-advice-card';
        
        title.className = 'modal-title';
        wrongAdviceContainer.appendChild(title);
        
        const text = document.createElement('p');
        text.className = 'advice-text';
        text.textContent = day.text || '';
        wrongAdviceContainer.appendChild(text);
        
        modalBodyEl.appendChild(wrongAdviceContainer);
      } else if (isUselessHoroscope) {
        // Create special useless horoscope card wrapper
        const horoscopeContainer = document.createElement('div');
        horoscopeContainer.className = 'useless-horoscope-card';
        
        title.className = 'modal-title';
        horoscopeContainer.appendChild(title);
        
        const text = document.createElement('p');
        text.className = 'horoscope-text';
        text.textContent = day.text || '';
        horoscopeContainer.appendChild(text);
        
        modalBodyEl.appendChild(horoscopeContainer);
      } else {
        // Regular card display
        const text = document.createElement('p');
        text.textContent = day.text || '';
        modalBodyEl.appendChild(title);
        // Place text above image (only if there's text)
        if (day.text) {
          modalBodyEl.appendChild(text);
        }
        if (day.image) {
          const img = document.createElement('img');
          img.src = day.image;
          img.alt = day.title || 'Advent image';
          modalBodyEl.appendChild(img);
          
          // Add download button for Drinks on ME cards or LEGO minifigure
          if (day.title.toLowerCase().includes('drinks on me')) {
            const downloadBtn = document.createElement('a');
            downloadBtn.href = day.image;
            downloadBtn.download = `${day.title || 'voucher'}.png`;
            downloadBtn.className = 'download-btn';
            downloadBtn.textContent = 'Download Voucher';
            modalBodyEl.appendChild(downloadBtn);
          } else if (day.title.toLowerCase().includes('lego minifigure')) {
            const downloadBtn = document.createElement('a');
            downloadBtn.href = day.image;
            downloadBtn.download = `${day.title || 'minifigure'}.png`;
            downloadBtn.className = 'download-btn';
            downloadBtn.textContent = 'Download Minifigure';
            modalBodyEl.appendChild(downloadBtn);
          }
        }
        // Add care instructions below image if present
        if (day.care) {
          const careText = document.createElement('p');
          careText.className = 'care-instructions';
          careText.textContent = day.care;
          modalBodyEl.appendChild(careText);
        }
      }
      if (day.link) {
        // If it's a Spotify track, embed the player
        if (day.link.includes('open.spotify.com/track')) {
          const embedSrc = day.link.replace('open.spotify.com/track', 'open.spotify.com/embed/track') + '?utm_source=generator';
          const iframe = document.createElement('iframe');
          iframe.src = embedSrc;
          iframe.width = '100%';
          iframe.height = '352';
          iframe.allowFullscreen = true;
          iframe.loading = 'lazy';
          iframe.setAttribute('allow', 'autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture');
          iframe.style.border = '0';
          iframe.style.borderRadius = '12px';
          iframe.style.margin = '16px 0';
          modalBodyEl.appendChild(iframe);
        }
        // Also add a button to open externally
        const a = document.createElement('a');
        a.href = day.link;
        a.textContent = 'Open link';
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        modalBodyEl.appendChild(a);
      }
    }
    modalEl.setAttribute('aria-hidden', 'false');
  }

  function closeModal() {
    modalEl.setAttribute('aria-hidden', 'true');
  }

  function bindUI() {
    modalCloseEl.addEventListener('click', closeModal);
    modalEl.addEventListener('click', (e) => {
      if (e.target === modalEl) closeModal();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeModal();
    });


    // Login
    if (loginForm) {
      loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const user = usernameEl.value;
        const pass = passcodeEl.value.trim();
        if (!PASSCODES[user]) { alert('Unknown user'); return; }
        if (PASSCODES[user] !== pass) { alert('Invalid passcode'); return; }
        currentUser = user;
        localStorage.setItem(USER_KEY, currentUser);
        // Per-user opened state
        const perUserKey = `${STORAGE_KEY}.${currentUser}`;
        opened = new Set(JSON.parse(localStorage.getItem(perUserKey) || '[]'));
        updateUserUI();
        // Immediately hide login and show calendar
        toggleViews();
        // Load content and render once ready
        loadDays().then(() => {
          render();
        });
      });
    }
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        currentUser = null;
        localStorage.removeItem(USER_KEY);
        toggleViews();
      });
    }
  }

  async function loadDays() {
    try {
      const file = currentUser ? `assets/days-${currentUser}.json` : 'assets/days.json';
      const res = await fetch(file);
      const json = await res.json();
      daysData = Array.isArray(json) ? json.slice(0, 25) : [];
      // Ensure 25 entries
      while (daysData.length < 25) {
        const n = daysData.length + 1;
        daysData.push({ title: `Day ${n}`, text: 'Add your message here.' });
      }
    } catch (err) {
      console.error('Failed to load days.json', err);
      daysData = Array.from({ length: 25 }, (_, i) => ({ title: `Day ${i+1}`, text: 'Surprise!' }));
    }
  }

  function updateUserUI() {
    if (currentUser) {
      userInfoEl.hidden = false;
      currentUserLabelEl.textContent = `Logged in: ${currentUser}`;
      // Show personalized greeting
      const greetingEl = document.getElementById('christmasGreeting');
      const greetingNameEl = document.getElementById('greetingName');
      const greetingTextEl = document.querySelector('.greeting-text');
      if (greetingEl && greetingNameEl) {
        greetingEl.hidden = false;
        greetingNameEl.textContent = 'love, Julienne';
        // Apply per-letter animation to both lines
        if (greetingTextEl) applyPerLetterAnimation(greetingTextEl);
        if (greetingNameEl) applyPerLetterAnimation(greetingNameEl);
      }
    } else {
      userInfoEl.hidden = true;
      currentUserLabelEl.textContent = '';
      // Hide greeting
      const greetingEl = document.getElementById('christmasGreeting');
      if (greetingEl) greetingEl.hidden = true;
    }
  }

  function applyPerLetterAnimation(el) {
    const text = el.textContent;
    const frag = document.createDocumentFragment();
    el.textContent = '';
    const colorClasses = ['red', 'green', 'yellow'];
    Array.from(text).forEach((ch, i) => {
      const span = document.createElement('span');
      span.className = `greet-char ${colorClasses[i % 3]}`;
      span.textContent = ch;
      span.style.marginRight = ch === ' ' ? '0.5em' : '0';
      frag.appendChild(span);
    });
    el.appendChild(frag);

    // Animate bulbs: shift colors every 400ms
    let offset = 0;
    const spans = el.querySelectorAll('.greet-char');
    if (spans.length) {
      if (el._bulbInterval) clearInterval(el._bulbInterval);
      el._bulbInterval = setInterval(() => {
        offset = (offset + 1) % colorClasses.length;
        spans.forEach((span, i) => {
          colorClasses.forEach(c => span.classList.remove(c));
          span.classList.add(colorClasses[(i + offset) % colorClasses.length]);
        });
      }, 400);
    }
  }

  function toggleViews() {
    const showLogin = !currentUser;
    if (loginSection) {
      loginSection.hidden = !showLogin;
      loginSection.style.display = showLogin ? 'block' : 'none';
    }
    calendarEl.style.display = showLogin ? 'none' : 'grid';
    if (!showLogin) updateUserUI();
  }

  (async function init(){
    bindUI();
    updateUserUI();
    toggleViews();
    await loadDays();
    render();
    setupSnow();
  })();

  function showLockedMessage(dayNumber) {
    const unlockDate = new Date(currentYear, 11, dayNumber, 0, 0, 0); // December is month 11
    const now = new Date();
    const diff = unlockDate - now;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    const lockedModal = document.createElement('div');
    lockedModal.className = 'locked-modal';
    lockedModal.innerHTML = `
      <div class="locked-content">
        <div class="locked-icon">🔒</div>
        <h3>Day ${dayNumber} is Locked</h3>
        <div class="countdown-display">
          <p class="countdown-text">Opens in:</p>
          <p class="countdown-time">${days} days, ${hours} hours, ${minutes} minutes</p>
        </div>
        <p class="hint">🎄 Come back on the unlock date to open this surprise!</p>
        <button class="btn" onclick="this.closest('.locked-modal').remove()">Got it</button>
      </div>
    `;
    document.body.appendChild(lockedModal);
    setTimeout(() => lockedModal.classList.add('show'), 10);
  }

  // Simple confetti effect
  function triggerConfetti() {
    const canvas = document.getElementById('confettiCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width = window.innerWidth;
    const h = canvas.height = window.innerHeight;
    const pieces = Array.from({ length: 100 }, () => ({
      x: Math.random() * w,
      y: -10,
      r: 2 + Math.random() * 4,
      c: Math.random() < 0.5 ? '#bc4749' : '#a7c957',
      vy: 2 + Math.random() * 3,
      vx: -1 + Math.random() * 2
    }));
    let frames = 0;
    function draw() {
      ctx.clearRect(0,0,w,h);
      pieces.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        ctx.fillStyle = p.c;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI*2); ctx.fill();
      });
      frames++;
      if (frames < 120) requestAnimationFrame(draw); else ctx.clearRect(0,0,w,h);
    }
    draw();
  }

  // Trigger Olaf wave
  // Generate simple snowflakes
  function setupSnow() {
    const snow = document.getElementById('snow');
    if (!snow) return;
    for (let i = 0; i < 40; i++) {
      const flake = document.createElement('div');
      flake.className = 'flake';
      flake.style.left = Math.random() * 100 + 'vw';
      flake.style.animationDuration = 6 + Math.random() * 8 + 's';
      flake.style.animationDelay = Math.random() * 6 + 's';
      flake.style.opacity = (0.4 + Math.random() * 0.6).toFixed(2);
      snow.appendChild(flake);
    }
  }

  function showAffirmationModal(affirmationText) {
    // Create or get affirmation modal overlay
    let affirmationOverlay = document.getElementById('affirmationOverlay');
    if (!affirmationOverlay) {
      affirmationOverlay = document.createElement('div');
      affirmationOverlay.id = 'affirmationOverlay';
      affirmationOverlay.className = 'affirmation-modal-overlay';
      
      const paper = document.createElement('div');
      paper.className = 'affirmation-paper';
      
      const content = document.createElement('div');
      content.className = 'affirmation-content';
      
      const text = document.createElement('p');
      text.className = 'affirmation-text';
      text.textContent = affirmationText;
      
      const closeBtn = document.createElement('button');
      closeBtn.className = 'affirmation-close-btn';
      closeBtn.textContent = '✕';
      closeBtn.addEventListener('click', closeAffirmationModal);
      
      content.appendChild(text);
      paper.appendChild(content);
      paper.appendChild(closeBtn);
      affirmationOverlay.appendChild(paper);
      document.body.appendChild(affirmationOverlay);
      
      // Close on overlay click
      affirmationOverlay.addEventListener('click', (e) => {
        if (e.target === affirmationOverlay) closeAffirmationModal();
      });
      
      // Close on Escape key
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && affirmationOverlay.classList.contains('show')) {
          closeAffirmationModal();
        }
      });
    } else {
      // Update text if overlay already exists
      const textEl = affirmationOverlay.querySelector('.affirmation-text');
      if (textEl) textEl.textContent = affirmationText;
    }
    
    // Show the modal
    affirmationOverlay.classList.add('show');
  }

  function closeAffirmationModal() {
    const affirmationOverlay = document.getElementById('affirmationOverlay');
    if (affirmationOverlay) {
      affirmationOverlay.classList.remove('show');
    }
  }
})();
