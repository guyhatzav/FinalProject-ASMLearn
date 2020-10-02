jQuery(document).ready(function ($) {

	var isHome = true;

	//open popup
	$('.cd-popup-trigger').on('click', function(event){
		event.preventDefault();
		isHome = $(event.target).is('.home-button');
		$('.cd-popup').addClass('is-visible');
	});

	$('.prefer-to-exit').on('click', function (event) {
		event.preventDefault();
		window.location = isHome ? 'dashboard.html' : `editor.html?task=${new URLSearchParams(window.location.search).get('task')}`;
	});

	//close popup
	$('.cd-popup').on('click', function(event){
		if ($(event.target).is('.cd-popup-close') || $(event.target).is('.cd-popup') || $(event.target).is('.prefer-to-stay') ) {
			event.preventDefault();
			$(this).removeClass('is-visible');
		}
	});
	//close popup when clicking the esc keyboard button
	$(document).keyup(function(event){
    	if(event.which=='27'){
    		$('.cd-popup').removeClass('is-visible');
	    }
    });
});