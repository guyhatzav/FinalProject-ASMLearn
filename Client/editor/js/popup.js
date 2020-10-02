jQuery(document).ready(function ($) {
	//open popup
	$('.cd-popup-trigger').on('click', function(event){
		event.preventDefault();
		isHome = $(event.target).is('.home-button');
		$('.cd-popup').addClass('is-visible');
	});

	$('.prefer-to-exit').on('click', function (event) {
		event.preventDefault();
		document.getElementById('page-start-loading').style.display = 'block';
		document.getElementById('editor-full-container').style.display = 'none';
		$('.cd-popup').removeClass('is-visible');
		const removeTaskPromise = (functions.httpsCallable('removeTask'))({ taskID: taskID });
		removeTaskPromise.then(result => { window.location = 'dashboard.html' });
		removeTaskPromise.catch(error => { window.location = 'dashboard.html' });
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