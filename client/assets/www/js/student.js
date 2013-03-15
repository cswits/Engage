            function student_feedback_init() {
                $('[data-role=header],[data-role=footer]').fixedtoolbar({ tapToggle:false });
                $("#eContent_student_bulb_on").css("width",$(window).width());
                $("#eContent_student_bulb_off").css("width",$(window).width());
                $(window).bind('resize',function(){
                    var w = $(window).width();
                    var h = $(window).height()-80;
                    var h_head = $("eHeader2").height();

                    var bulb_width = w-40;
                    if (bulb_width*1.78 > h){
                        bulb_width = h/1.8;
                    }
                    $("#eContent_student_bulb_on").css("width",bulb_width);
                    $("#eContent_student_bulb_off").css("width",bulb_width);
                    $(".ui-slider-vertical").css("height",0.9*(h-2*h_head));
                    $(".ui-slider-verticalInverted").css("height",0.8*$("#eContent_student_bulb_off").height()-40);
                }).trigger('resize');
                $("#slider").change(function(){
                    var slider_value = $(this).val();
                    $("#eContent_student_bulb_on").css("opacity", slider_value/100);
                });
            }

function student_codeentry_init(){
}

