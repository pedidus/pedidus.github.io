/*
  Script requires ES6 features. All browsers except IE11.

  To implement tracking on a shop page, just create the shop page by copying
  _template/index.html, that is already setup with tracking.

  To implement tracking on a exsiting page, add all tracking attributes to the
  html where required (search in _template/index.html for tags, to see where they
  are required. Tags:
    data-track-product-open
    data-track-product-name
    data-track-product-price
    data-track-product-order
    data-track-product-order-parent
    data-track-generic-contact
  Also add the <script> tag to load the analytics script, as shown at the bottom of
  _template/index.html.
*/


setupAnalytics();

function setupAnalytics() {
  var id = 'UA-164287373-2' // DEV env
  if(document.location.href.startsWith("https://pedid.us")){
    id = 'UA-164287373-1' // PROD env
  }
  // ganalytics API: https://github.com/lukeed/ganalytics  
  const ga = ganalytics(id);
  
  //--------------------------------------------------------------------------
  // 'Product open' tracking
  //--------------------------------------------------------------------------
  document
    .querySelectorAll('[data-track-product-open]')
    .forEach(item => item.addEventListener('click',(event) => {
      const productDomNode = event.currentTarget
      // 1. virtual page view (funnel)
      ga.send('pageview', {
        dt: document.title, 
        dl: virtualTrackingPage(
          document.location.href,
          'open', 
          productName(productDomNode)
        )
      })
    }))

  //--------------------------------------------------------------------------
  // 'Product order' tracking
  //--------------------------------------------------------------------------
  document
    .querySelectorAll('[data-track-product-order]')
    .forEach(item => item.addEventListener('click',(event) => {
      const productDomNode = event.currentTarget.closest('[data-track-product-order-parent]')
      // 1. virtual page view (funnel)
      ga.send('pageview', { 
        dt: document.title, 
        dl: virtualTrackingPage(
          document.location.href, 
          'order', 
          productName(productDomNode)
        )
      })
      // 2. event (quantitative analytics)
      ga.send('event', {
        ec: 'order', 
        ea: sellerName(document.location.href), 
        el: productName(productDomNode), 
        ev: productPrice(productDomNode)
      });
    }))

  //--------------------------------------------------------------------------
  // 'Generic contact' tracking
  //--------------------------------------------------------------------------
  document
    .querySelectorAll('[data-track-generic-contact]')
    .forEach(item => item.addEventListener('click',(event) => {
      // 1. virtual page view (funnel)
      ga.send('pageview', { 
        dt: document.title, 
        dl: virtualTrackingPage(
          document.location.href,
          'contact', 
          ''
        )
      })
      // 2. event (quantitative analytics)
      ga.send('event', {
        ec: 'contact', 
        ea: sellerName(document.location.href), 
        el: "unknown", 
        ev: 0
      });
    }))

  //--------------------------------------------------------------------------
  // Helpers
  //--------------------------------------------------------------------------

  /*
    function productName(domNode)
    params: 
      dom node having a descendant marked with attribute 'data-track-product-name'
      Ex:
      <div>
        <div>
          <h1 data-track-product-name class="font-16">Yâkisobá Vegetariano 700 gr</h1>
        </div>
      </div>
    return: 
      'yakisoba-vegetariano-700-gr'
  */
  function productName(domNode){
    if(! domNode){
      return 'unknown'
    }
    const productNode = domNode.querySelector('[data-track-product-name]')
    if(! productNode){
      return 'unknown'
    }
    return productNode
      .innerText
      .trim()
      .replace(/\s{2,}/g, ' ')
      .replace(/\s/g, '-')
      .replace(/\./g, '-')
      .replace(/_/g, '-')
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
  }

  /*
    function productPrice(domNode)
    params: 
      dom node having a descendant marked with attribute 'data-track-product-price'
      Ex:
      <div>
        <div>
          <p data-track-product-price class="color-highlight under-heading font-14 bottom-15">
            R$ 20,99 <small class="font-10 color-dark1-light">+ taxa de entrega</small>
          </p>
        </div>
      </div>
    return: 
      20
  */
  function productPrice(domNode){
    if(! domNode){
      return 'unknown'
    }
    const priceNode = domNode.querySelector('[data-track-product-price]')
    if(! priceNode){
      return 'unknown'
    }
    return priceNode
      .innerText
      .replace(/^\D*(\d*).*/g, '$1')
  }

  /*
    function virtualTrackingPage(url, actionName, productName)
    params: 
      'https://pedid.us/grao-culinaria-integral/'
      'open' or 'order'
      'nhoque-de-batata-doce'
    return: 
      'https://pedid.us/grao-culinaria-integral/order/nhoque-de-batata-doce'
  */
  function virtualTrackingPage(url, actionName, productName){
    return `${document.location.href}/${actionName}/${productName}`
    .replace(/\/\//g, '/')
    .replace(/:\//, '://')
  }

  /*
    function sellerName(url)
    params: 
      'https://pedid.us/grao-culinaria-integral/'
    return: 
      'grao-culinaria-integral'
  */
  function sellerName(url){
    const matches = url.match(/https?:\/\/[\w:.]+\/([\w\.-]+)\/?/i)
    if( matches && matches.length >= 1 ){
      return matches[1]
    }
    else {
      return "unknown"
    }
  }
}

// https://github.com/lukeed/ganalytics/blob/master/src/index.js
function ganalytics(ua, args, toWait) {
  var KEY = 'ga:user';
  
	args = Object.assign({}, args, {
		tid: ua,
		cid: (localStorage[KEY] = localStorage[KEY] || Math.random() + '.' + Math.random())
	});

	function send(type, opts) {
		if (type === 'pageview' && !opts) {
			opts = { dl:location.href, dt:document.title };
		}
		var k, str='https://www.google-analytics.com/collect?v=1';
		var obj = Object.assign({ t:type }, args, opts, { z:Date.now() });
		for (k in obj) {
			// modified `obj-str` behavior
			if (obj[k]) str += ('&' + k + '=' + encodeURIComponent(obj[k]));
		}
		new Image().src = str; // dispatch a GET
	}

	toWait || send('pageview');

	return { args, send };
}