const videoHero = document.querySelector('.video-hero');

videoHero.addEventListener('mousemove', (p) => {
  videoHero.style.setProperty('--x', p.clientX + 'px');
  videoHero.style.setProperty('--y', p.clientY + 'px');
});


const cursor = document.querySelector('.cursor');
document.addEventListener('mousemove', (e) =>{
  cursor.style.left = e.pageX + 'px';
  cursor.style.top = e.pageY + 'px';
})

const mainContainer = document.querySelector('.main-container');
const mainCursor = document.querySelector('.main-container-cursor');

mainContainer.addEventListener('mousemove', (xe) => {
  mainCursor.style.left = xe.clientX + 'px';
  mainCursor.style.top = xe.clientY + 'px';
  mainCursor.style.display = 'block';
});

mainContainer.addEventListener('mouseleave', () => {
  mainCursor.style.display = 'none';
});


function hideSidebar(){
  const sidebar= document.querySelector('.sidebar')
  sidebar.style.display='none'
  document.body.classList.remove('no-scroll')

}

function showSidebar(){
  const sidebar= document.querySelector('.sidebar')
  sidebar.style.display='flex'
  document.body.classList.add('no-scroll')
}

// Initialize language when page loads
  initializeLanguage();

  const overlay = document.querySelector(".shadow");
  const readyBtn = document.getElementById("imready-btn");
  let hasFaded = false;

    document.addEventListener("mousemove", (e) => {
      if (!overlay.classList.contains("fade-out")){
        overlay.style.setProperty("--x", `${e.clientX}px`);
        overlay.style.setProperty("--y", `${e.clientY}px`);
      }
    });

    readyBtn.addEventListener("click", () => {
      if (readyBtn.classList.contains("ready-to-signup")) {
        window.location.href = "signUp.html";
        return;
      }
      
      if (!hasFaded){
        const customCursor = document.querySelector('.video-hero .custom-cursor');
        if (customCursor) {
          customCursor.remove();
          customCursor.classList.add('fade-out');
          setTimeout(() => {
            customCursor.remove();
          }, 300); 
        }
        // overlay.classList.add("fade-out");
        document.body.classList.add("default-cursor");

        readyBtn.style.opacity = "0";
        setTimeout(() => {
          readyBtn.textContent = "Sign Up Now";
          readyBtn.style.opacity="1"; 
          readyBtn.classList.add("ready-to-signup");
        }, 1000);
        
        hasFaded = true;
      }
    });
  
function handleRoleChange(role) {
    const farmBox = document.getElementById("farm-reg-box");
    const companyBox = document.getElementById("company-id-box");

    if (role === "farmer") {
      farmBox.style.display = "block";
      companyBox.style.display = "none";
      document.getElementById("farmReg").required = true;
      document.getElementById("companyId").required = false;
    } else if (role === "company") {
      farmBox.style.display = "none";
      companyBox.style.display = "block";
      document.getElementById("farmReg").required = false;
      document.getElementById("companyId").required = true;
    }
  }

function initializeLanguage() {
  const html = document.getElementById("html");
  
  // Set initial language based on stored preference
  if (currentLang === "ar") {
    html.lang = "ar";
    html.dir = "rtl";
  } else {
    html.lang = "en";
    html.dir = "ltr";
  }
  
  applyTranslations();
}


function applyTranslations() {
  for (const key in translations[currentLang]) {
    const element = document.getElementById(key);
    if (element) {
      if (element.tagName === 'INPUT') {
        element.value = translations[currentLang][key];
      } else {
        element.innerText = translations[currentLang][key];
      }
    }
    
    // Also handle elements with data-key attribute
    const elementsWithDataKey = document.querySelectorAll(`[data-key="${key}"]`);
    elementsWithDataKey.forEach(element => {
      if (element.tagName === 'INPUT') {
        element.value = translations[currentLang][key];
      } else {
        element.innerText = translations[currentLang][key];
      }
    });
  }
}

function goToMaps(){
    
}
  

    //  const scrollers = document.querySelectorAll(".main-container");
    //  // If a user hasn't opted in for recuded motion, then we add the animation
    //  if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    //    addAnimation();
    //  }
     
    //  function addAnimation() {
    //    scrollers.forEach((scroller) => {
    //      // add data-animated="true" to every `.scroller` on the page
    //      scroller.setAttribute("data-animated", true);
     
    //      // Make an array from the elements within `.scroller-inner`
    //      const scrollerInner = scroller.querySelector(".scroller__inner");
    //      const scrollerContent = Array.from(scrollerInner.children);
     
    //      // For each item in the array, clone it
    //      // add aria-hidden to it
    //      // add it into the `.scroller-inner`
    //      scrollerContent.forEach((item) => {
    //        const duplicatedItem = item.cloneNode(true);
    //        duplicatedItem.setAttribute("aria-hidden", true);
    //        scrollerInner.appendChild(duplicatedItem);
    //      });
    //    });
    //  }
      