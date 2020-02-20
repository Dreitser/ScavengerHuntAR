const Http = new XMLHttpRequest();
const url='https://scav1.herokuapp.com/players';


/**
 * Checks that an element has a non-empty `name` and `value` property.
 * @param  {Element} element  the element to check
 * @return {Bool}             true if the element is an input, false if not
 */
const isValidElement = element => {
return element.name && element.value;
};

/**
 * Checks if an element’s value can be saved (e.g. not an unselected checkbox).
 * @param  {Element} element  the element to check
 * @return {Boolean}          true if the value should be added, false if not
 */
const isValidValue = element => {
  return (!['checkbox', 'radio'].includes(element.type) || element.checked);
};

/**
 * Checks if an input is a checkbox, because checkboxes allow multiple values.
 * @param  {Element} element  the element to check
 * @return {Boolean}          true if the element is a checkbox, false if not
 */
const isCheckbox = element => element.type === 'checkbox';

/**
 * Checks if an input is a `select` with the `multiple` attribute.
 * @param  {Element} element  the element to check
 * @return {Boolean}          true if the element is a multiselect, false if not
 */
const isMultiSelect = element => element.options && element.multiple;

/**
 * Retrieves the selected options from a multi-select as an array.
 * @param  {HTMLOptionsCollection} options  the options for the select
 * @return {Array}                          an array of selected option values
 */
const getSelectValues = options => [].reduce.call(options, (values, option) => {
  return option.selected ? values.concat(option.value) : values;
}, []);

/**
 * A more verbose implementation of `formToJSON()` to explain how it works.
 *
 * NOTE: This function is unused, and is only here for the purpose of explaining how
 * reducing form elements works.
 *
 * @param  {HTMLFormControlsCollection} elements  the form elements
 * @return {Object}                               form data as an object literal
 */
const formToJSON_deconstructed = elements => {
  
  // This is the function that is called on each element of the array.
  const reducerFunction = (data, element) => {
    
    // Add the current field to the object.
    data[element.name] = element.value;
    
    // For the demo only: show each step in the reducer’s progress.
    console.log(JSON.stringify(data));

    return data;
  };
  
  // This is used as the initial value of `data` in `reducerFunction()`.
  const reducerInitialValue = {};
  
  // To help visualize what happens, log the inital value, which we know is `{}`.
  console.log('Initial `data` value:', JSON.stringify(reducerInitialValue));
  
  // Now we reduce by `call`-ing `Array.prototype.reduce()` on `elements`.
  const formData = [].reduce.call(elements, reducerFunction, reducerInitialValue);
  
  // The result is then returned for use elsewhere.
  return formData;
};

/**
 * Retrieves input data from a form and returns it as a JSON object.
 * @param  {HTMLFormControlsCollection} elements  the form elements
 * @return {Object}                               form data as an object literal
 */
const formToJSON = elements => [].reduce.call(elements, (data, element) => {

  // Make sure the element has the required properties and should be added.
  if (isValidElement(element) && isValidValue(element)) {

    /*
     * Some fields allow for more than one value, so we need to check if this
     * is one of those fields and, if so, store the values as an array.
     */
    if (isCheckbox(element)) {
      data[element.name] = (data[element.name] || []).concat(element.value);
    } else if (isMultiSelect(element)) {
      data[element.name] = getSelectValues(element);
    } else {
      data[element.name] = element.value;
    }
  }

  return data;
}, {});


/**
 * A handler function to prevent default submission and run our custom script.
 * @param  {Event} event  the submit event triggered by the user
 * @return {void}
 */
const handleFormSubmit = event => {
  
  // Stop the form from submitting since we’re handling that with AJAX.
  event.preventDefault();
  
  // Call our function to get the form data.
  const data = formToJSON(form.elements);

  // Demo only: print the form data onscreen as a formatted JSON object.
  const dataContainer = document.getElementsByClassName('results__display')[0];
  
  // Use `JSON.stringify()` to make the output valid, human-readable JSON.
  dataContainer.textContent = JSON.stringify(data, null, "  ");
  
  // var request = new XMLHttpRequest()

//   // Open a new connection, using the GET request on the URL endpoint
//   Http.open('POST', url , true);
//   Http.setRequestHeader('Content-type', 'application/json; charset=utf-8');
 

// // Send request
//   Http.send(dataContainer)
  // Http.onload = () => alert(Http.response);

let xhr = new XMLHttpRequest();

let json = JSON.stringify({
  username: "John",
  score: 100
});

xhr.open("POST", 'https://scav1.herokuapp.com/players/')
xhr.setRequestHeader('Content-type', 'application/json; charset=utf-8');

xhr.send(json);
}
// form.addEventListener('submit', handleFormSubmit(form.Event));
/*
 * This is where things actually get started. We find the form element using
 * its class name, then attach the `handleFormSubmit()` function to the 
 * `submit` event.
 */

// const form = document.getElementsByClassName('contact-form');
// form.addEventListener('click', handleFormSubmit);

document.getElementsByClassName('contact-form')[0].addEventListener("click", handleFormSubmit);
document.querySelector('a-scene').addEventListener('loaded', function () { container.classList.remove('collapsed') });

AFRAME.registerComponent('artgalleryframe', {
  schema: {
    name: {type: 'string'},
    rotated: {type: 'bool'},
    metadata: {type: 'string'},
  },
  init: function () {
    const contents = document.getElementById('contents')
    const container = document.getElementById('container')

    const {object3D, sceneEl} = this.el

    // Hide the image target until it is found
    object3D.visible = false

    // Metadata comes to the primitive as a string, so we parse and destructure it
    const {artist, date, title, wikiTitle} = JSON.parse(this.data.metadata)

    const frameEl = document.createElement('a-entity')
    frameEl.setAttribute('scale', '0.95 0.95 0.95')
    frameEl.setAttribute('gltf-model', '#frame-model')
    if (this.data.rotated) {
      // Rotate the frame for a landscape target
      frameEl.setAttribute('rotation', '0 0 90')
    }
    this.el.appendChild(frameEl)

    // Instantiate the element with information about the painting
    const infoDisplay = document.createElement('a-entity')
    infoDisplay.setAttribute('info-display', {title, artist, date})
    infoDisplay.object3D.position.set(0, this.data.rotated ? -0.4 : -0.5, 0.1)
    this.el.appendChild(infoDisplay)

    // Use the title of the painting to fetch some info from the Wikipedia API
    // If a painting doesn't have a Wikipedia article of its own, we use the painter's article via wikiTitle
    const apiUrl = `https://en.wikipedia.org/w/api.php?action=query&titles=${wikiTitle || title}&format=json&prop=extracts&exintro=1&origin=*`
    let pageContent
    fetch(apiUrl, {mode: 'cors'})
    .then(e => e.json())
    .then(data => {
      const page = Object.entries(data.query.pages)[0][1]
      pageContent = `<h1>${page.title}</h1>${page.extract}`
    })

    const tapTarget = document.createElement('a-box')
    // Image targets are 3:4 so the target is scaled to match
    tapTarget.setAttribute('scale', '0.75 1 0.1')
    tapTarget.setAttribute('material', 'opacity: 0; transparent:true')
    if (this.data.rotated) {
      // Rotate the tap target for a landscape target
      tapTarget.setAttribute('rotation', '0 0 90')
    }
    this.el.appendChild(tapTarget)

    tapTarget.addEventListener('click', e => {
      // Set the innerHTML of our UI element to the data returned by the API
      contents.innerHTML = pageContent
      // Removing the collapsed class from container triggers a CSS transition to show the content
      container.classList.remove('collapsed')
    })

    // showImage handles displaying and moving the virtual object to match the image
    const showImage = ({detail}) => {
      // Updating position/rotation/scale using object3D is more performant than setAttribute
      object3D.position.copy(detail.position)
      object3D.quaternion.copy(detail.rotation)
      object3D.scale.set(detail.scale, detail.scale, detail.scale)
      object3D.visible = true
      // Add tapTarget as a clickable object
      tapTarget.classList.add('cantap')
    }

    // hideImage handles hiding the virtual object when the image target is lost
    const hideImage = () => {
      object3D.visible = false
      // Remove tapTarget from clickable objects
      tapTarget.classList.remove('cantap')
    }

    // These events are routed and dispatched by xrextras-generate-image-targets
    this.el.addEventListener('xrimagefound', showImage)
    this.el.addEventListener('xrimageupdated', showImage)
    this.el.addEventListener('xrimagelost', hideImage)
  }
})

// This component uses the A-Frame text component to display information about a painting
AFRAME.registerComponent('info-display', {
  schema: {
    title: {default: ''},
    artist: {default: ''},
    date: {default: ''},
  },
  init: function() {
    // Limit title to 20 characters
    const displayTitle = this.data.title.length > 20 ? `${this.data.title.substring(0, 17)}...` : this.data.title
    const text = displayTitle + '\n' + this.data.artist + ', ' + this.data.date
    const textData = {
      align: 'left',
      width: 0.7,
      wrapCount: 22,
      value: text,
      color: 'white',
    }

    this.el.setAttribute('text', textData )

    // Instantiate a second text object behind the first to achieve an shadow effect
    const textShadowEl = document.createElement('a-entity')
    textData.color = 'black'
    textShadowEl.setAttribute('text', textData)
    textShadowEl.object3D.position.z = -0.01
    this.el.appendChild(textShadowEl)
  }
})

// xrextras-generate-image-targets uses this primitive to automatically populate multiple image targets
AFRAME.registerPrimitive('artgallery-frame', {
  defaultComponents: {
    artgalleryframe: {},
  },

  mappings: {
    name: 'artgalleryframe.name',
    rotated: 'artgalleryframe.rotated',
    metadata: 'artgalleryframe.metadata',
  }
})
