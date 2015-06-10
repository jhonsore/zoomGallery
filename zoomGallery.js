(function($){
	//
	$.fn.zoomGallery = function( method )
	{
		var methods =
		{
			init :										function( options ){ 			return this.each(function(){	_init(this, options);});}
		};
		
		//----------------------------------------------------------------------
		//----------------------------------------------------------------------
		var defaults =
		{
			changeCursor				: false,
			loader						: null,
			centerThumbs				: false,
			timerAnimSlide				: 200,
			added						: function() {},//plugin adicionando
            destroyed					: function(){},//plugin removido
		};
		
		var plugin_settings;
		var plugin_element;
		var slider_zoom_gallery;
		var content;
		var container;
		var wrapperImagem;
		var setaEsq;
		var setaDir;
		var widthItem;
		var statusSlideAnim = false;
		var statusMouseOverWrapper = false;
		
		//----------------------------------------------------------------------
		//----------------------------------------------------------------------

		// Method calling logic
		if ( methods[method] )//caso exista um método, esse método é chamado
		{
			return methods[ method ].apply( this, Array.prototype.slice.call( arguments, 1 ));
		}
		else if ( typeof method === 'object' || ! method )//caso não exista um método ou seja apenas passado o objeto
		{
			return methods.init.apply( this, arguments );
		}
		else//caso o método não exista
		{
		  $.error( 'Method ' +  method + ' does not exist on jQuery.plugin' );
		}
		
		function _init($this, options)
		{
			plugin_element 						= $($this);
			plugin_settings 					= $.extend(defaults, options);				
			_initialize($this);
		}
		
		function _initialize($this)
		{
			//plugin adicionado
			plugin_settings.added.call();
			
			_initSlide();
			_loadImageMedia();
			
			wrapperImagem.mouseenter(function()
			{
				_checkWrapperZoom();
				
			});
			
			wrapperImagem.mouseleave(function()
			{
				
				if($(".wrapper-zoom",wrapperImagem).size()>0)
				{
					if($(".wrapper-zoom",wrapperImagem).hasClass('zoom-loaded'))
					{
						$(".wrapper-zoom",wrapperImagem).stop( true, true ).fadeOut(300);
					}
				}
				
				statusMouseOverWrapper = false;
				
			});
			
		}
		
		function _checkWrapperZoom ()
		{
			statusMouseOverWrapper = true;
			
			if($(".wrapper-zoom",wrapperImagem).size()>0)
			{
				if($(".wrapper-zoom",wrapperImagem).hasClass('zoom-loaded'))
				{
					//if(!$(".wrapper-zoom",wrapperImagem).is(':visible'))
					//{
						$(".wrapper-zoom",wrapperImagem).stop( true, true ).fadeIn(300);
						_moveImageZoom();
					//}
				}
			}
		}
						
		function _moveImageZoom ()
		{
			$(".content-zoom",wrapperImagem).unbind().mousemove(function (e) {				
				
				//---------------------------------------------
				var posx = 0;
				var posy = 0;
								
				var parentOffset = $(this).parent().offset();
				var relativeXPosition = (e.pageX - parentOffset.left);
       			var relativeYPosition = (e.pageY - parentOffset.top);
				
				var _thumb = $(".img-move",$(this));
				
				var _mouseY = relativeYPosition;
				var _mouseX = relativeXPosition;
				
				var ctposY = getSize(_thumb,'top');
				var ctposX = getSize(_thumb,'left');
				
				var widthMask = $(this).width();
				var heightMask = $(this).height();
				
				var xTemp = (_mouseX/widthMask)*((widthMask-_thumb.width()));
				var dgmX = (xTemp-ctposX)/5;
				
				var yTemp = (_mouseY/heightMask)*((heightMask - _thumb.height()));
				var dgmY = (yTemp-ctposY)/5;
				
				if(_thumb.height()>heightMask)
				{					
					if (dgmY < -0.050000 || dgmY > 0.050000)
						_thumb.css({top:(ctposY + dgmY)});
				}
				
				if(_thumb.width()>widthMask)
				{					
					if (dgmX < -0.050000 || dgmX > 0.050000)
						_thumb.css({left:(ctposX + dgmX)});
				}
								
				//------------------
				//------------------
				
			});
		}
				
		//------------------------------------------------
		//slide 
		//------------------------------------------------
		function _initSlide () 
		{
			//
			slider_zoom_gallery = $(".slider_zoom_gallery",plugin_element);
			content = $(".content",plugin_element);
			container = $(".container",plugin_element);
			wrapperImagem = $(".wrapper-imagem",plugin_element);
			setaEsq = $(".seta-esq",plugin_element);
			setaDir = $(".seta-dir",plugin_element);
			
			wrapperImagem.css({top:0, left:0});
			
			//resize content
			var _sizeItens = 0;
			var _marginRight = 0;
			var _interval;
			
			$(".item",content).each(function(index, element)
			{
				//item ativo
				if(index == 0)
				{
					$(element).addClass("ativo");
				}
				
				$(element).click(function()
				{
					if(!$(element).hasClass("ativo"))
					{
						if($(".ativo", content).size()>0)
						{
							$(".ativo", content).removeClass("ativo");
						}
						
						$(this).addClass("ativo");
						addLoader();
						clearTimeout(_interval);
						_interval = setTimeout(function()
						{
							_loadImageMedia();
							clearTimeout(_interval);
						},500);
					}
					return false;
				});
				
				//----------
				_marginRight = getSize($(element),"marginRight");
				
				//size item
				widthItem = $(element).outerWidth(true);
				
				//size content
				_sizeItens += widthItem;

            });
			
			content.width(_sizeItens);
			
			//oculta as setas se não tiver a quantidade de itens necessários para ter rolagem
			if((content.width()-_marginRight) <= container.width())
			{
				$(".wrapper-setas-slide", plugin_element).hide();
				slider_zoom_gallery.addClass("no-margin");
				container.width("100%");
				
				//centraliza thumbs caso a propriedade centerThumbs seja \true\
				if(plugin_settings.centerThumbs)
				{
					content.css({margin:"0 auto"});
				}
			}
			//end resize content			
			
			//setas
			setaEsq.click(function()
			{
				_moveSlide('left');
				return false;
			});
			
			setaDir.click(function()
			{
				_moveSlide('right');
				return false;
			});
		}
		
		//visualização da imagem média
		function _loadImageMedia ( ) 
		{
			
			if($(".wrapper-zoom",wrapperImagem).size()>0)
			{
				$(".wrapper-zoom",wrapperImagem).remove();
			}
			
			var img = new Image();
			addLoader ();
			_imageLoad = $(".ativo", content).attr("href");
			
			//carrega a imagem
			$(img).load(function(){
				wrapperImagem.empty();
				addLoader ();
				wrapperImagem.append($(img));
				$(img).hide(0);
				$(img).stop(true, true).fadeIn(200);
				_loadImageZoom();			
			}).attr({
			  src: _imageLoad
			}).error(function(){
			  //do something if image cannot load
			});
			
		}
		
		//visualização do zoom
		function _loadImageZoom ()
		{
						
			var img = new Image();
			
			_imageLoad = $(".ativo", content).data("zoom");
			
			var _width = wrapperImagem.width();
			var _height = wrapperImagem.height();
			var _cursor = (plugin_settings.changeCursor) ? "cursor:move;" : "";
			
			var _html = "<div class='wrapper-zoom' style='"+_cursor+" position:absolute; top:0; left:0; z-index:10; display:none; width:"+_width+"px;height:"+_height+"px'>";
				_html += "<div class='content-zoom' style='position:relative; top:0; left:0; width:"+_width+"px;height:"+_height+"px'>";
				_html += "</div>";
				_html += "</div>";
				
			wrapperImagem.append(_html);
			
			//carrega a imagem
			$(img).load(function(){
				$(".content-zoom",wrapperImagem).append($(img));
				$(img).addClass("img-move");
				$(img).css({left:0, top:0, position:'absolute'});
				$(".wrapper-zoom",wrapperImagem).addClass('zoom-loaded');
				removeLoader ();
				
				//checa se o mouse está por cima da imagem mesmo sem o zoom ter carregado
				if(statusMouseOverWrapper)
				{
					_checkWrapperZoom ();
				}
			}).attr({
			  src: _imageLoad
			}).error(function(){
			  //do something if image cannot load
			});
		}
		
		function _moveSlide ( arg_ )
		{
			var _xMove;
			var _posAtual = getSize(content,"marginLeft");
			var _maxPosMove = content.width() -  container.width();
			
			if( arg_ == "right" )
			{
				_xMove = -(widthItem - _posAtual);
				
				if((Math.abs(_xMove) < Math.abs(_maxPosMove)) && !statusSlideAnim)
				{
					statusSlideAnim = true;
					content.stop().animate({marginLeft:_xMove},plugin_settings.timerAnimSlide,function(){statusSlideAnim = false;});
				}
			}
			else
			{
				_xMove = (_posAtual + widthItem);
				
				if((_xMove <= 0) &&  !statusSlideAnim)
				{
					statusSlideAnim = true;
					content.stop().animate({marginLeft:_xMove},plugin_settings.timerAnimSlide,function(){statusSlideAnim = false;});
				}
			}			
		}
		
		function addLoader ()
		{
			if(plugin_settings.loader != null)
			{
				if($('.loader_zoom_gallery').size() > 0){	$('.loader_zoom_gallery').remove();}
				
				var _class = (plugin_settings.loader.class) ? String(plugin_settings.loader.class) : "";
				
				var _loader = $("<div class='loader_zoom_gallery "+_class+"'><img src='"+plugin_settings.loader.src+"'></div>");
				wrapperImagem.append(_loader);
			}
		}
		
		function removeLoader ()
		{
			if(plugin_settings.loader != null)
			{
				if($('.loader_zoom_gallery').size() > 0){	$('.loader_zoom_gallery').remove();}
			}
		}
		
		//utils
		function getSize(_obj,_css)
		{
			if(_obj.size()>0)
			{
				var _regExp = new RegExp("[a-z][A-Z]","g");
				return parseFloat(_obj.css(_css).replace(_regExp, ""));
			}
		}

    
	};//-------------------------------
})(jQuery);
