const pageX = $(document).width(), pageY = $(document).height();

$(document).mousemove(event => {
    yAxis = (pageY / 2 - event.pageY) / pageY * 300; /* Vertical Axis */
    xAxis = -(event.pageX / -pageX) * 100 - 100; /* Horizontal Axis */
    $('.box__ghost-eyes').css({ 'transform': `translate(${xAxis}%, -${yAxis}%)` });
});