/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/


dojo._hasResource["dojox.layout.FloatingPane"]||(dojo._hasResource["dojox.layout.FloatingPane"]=!0,dojo.provide("dojox.layout.FloatingPane"),dojo.experimental("dojox.layout.FloatingPane"),dojo.require("dojo.window"),dojo.require("dijit._Templated"),dojo.require("dijit._Widget"),dojo.require("dojo.dnd.Moveable"),dojo.require("dojox.layout.ContentPane"),dojo.require("dojox.layout.ResizeHandle"),dojo.declare("dojox.layout.FloatingPane",[dojox.layout.ContentPane,dijit._Templated],{closable:!0,dockable:!0,
resizable:!1,maxable:!1,resizeAxis:"xy",title:"",dockTo:"",duration:400,contentClass:"dojoxFloatingPaneContent",_showAnim:null,_hideAnim:null,_dockNode:null,_restoreState:{},_allFPs:[],_startZ:100,templateString:dojo.cache("dojox.layout","resources/FloatingPane.html",'<div class="dojoxFloatingPane" id="${id}">\n\t<div tabindex="0" role="button" class="dojoxFloatingPaneTitle" dojoAttachPoint="focusNode">\n\t\t<span dojoAttachPoint="closeNode" dojoAttachEvent="onclick: close" class="dojoxFloatingCloseIcon"></span>\n\t\t<span dojoAttachPoint="maxNode" dojoAttachEvent="onclick: maximize" class="dojoxFloatingMaximizeIcon">&thinsp;</span>\n\t\t<span dojoAttachPoint="restoreNode" dojoAttachEvent="onclick: _restore" class="dojoxFloatingRestoreIcon">&thinsp;</span>\t\n\t\t<span dojoAttachPoint="dockNode" dojoAttachEvent="onclick: minimize" class="dojoxFloatingMinimizeIcon">&thinsp;</span>\n\t\t<span dojoAttachPoint="titleNode" class="dijitInline dijitTitleNode"></span>\n\t</div>\n\t<div dojoAttachPoint="canvas" class="dojoxFloatingPaneCanvas">\n\t\t<div dojoAttachPoint="containerNode" role="region" tabindex="-1" class="${contentClass}">\n\t\t</div>\n\t\t<span dojoAttachPoint="resizeHandle" class="dojoxFloatingResizeHandle"></span>\n\t</div>\n</div>\n'),
attributeMap:dojo.delegate(dijit._Widget.prototype.attributeMap,{title:{type:"innerHTML",node:"titleNode"}}),postCreate:function(){this.inherited(arguments);new dojo.dnd.Moveable(this.domNode,{handle:this.focusNode});if(!this.dockable)this.dockNode.style.display="none";if(!this.closable)this.closeNode.style.display="none";if(!this.maxable)this.maxNode.style.display="none",this.restoreNode.style.display="none";this.resizable?this.domNode.style.width=dojo.marginBox(this.domNode).w+"px":this.resizeHandle.style.display=
"none";this._allFPs.push(this);this.domNode.style.position="absolute";this.bgIframe=new dijit.BackgroundIframe(this.domNode);this._naturalState=dojo.coords(this.domNode)},startup:function(){if(!this._started){this.inherited(arguments);if(this.resizable)dojo.isIE?this.canvas.style.overflow="auto":this.containerNode.style.overflow="auto",this._resizeHandle=new dojox.layout.ResizeHandle({targetId:this.id,resizeAxis:this.resizeAxis},this.resizeHandle);if(this.dockable){var a=this.dockTo;this.dockTo=this.dockTo?
dijit.byId(this.dockTo):dijit.byId("dojoxGlobalFloatingDock");if(!this.dockTo){var b;a?(b=a,a=dojo.byId(a)):(a=dojo.create("div",null,dojo.body()),dojo.addClass(a,"dojoxFloatingDockDefault"),b="dojoxGlobalFloatingDock");this.dockTo=new dojox.layout.Dock({id:b,autoPosition:"south"},a);this.dockTo.startup()}(this.domNode.style.display=="none"||this.domNode.style.visibility=="hidden")&&this.minimize()}this.connect(this.focusNode,"onmousedown","bringToTop");this.connect(this.domNode,"onmousedown","bringToTop");
this.resize(dojo.coords(this.domNode));this._started=!0}},setTitle:function(a){dojo.deprecated("pane.setTitle","Use pane.set('title', someTitle)","2.0");this.set("title",a)},close:function(){this.closable&&(dojo.unsubscribe(this._listener),this.hide(dojo.hitch(this,function(){this.destroyRecursive()})))},hide:function(a){dojo.fadeOut({node:this.domNode,duration:this.duration,onEnd:dojo.hitch(this,function(){this.domNode.style.display="none";this.domNode.style.visibility="hidden";this.dockTo&&this.dockable&&
this.dockTo._positionDock(null);a&&a()})}).play()},show:function(a){dojo.fadeIn({node:this.domNode,duration:this.duration,beforeBegin:dojo.hitch(this,function(){this.domNode.style.display="";this.domNode.style.visibility="visible";this.dockTo&&this.dockable&&this.dockTo._positionDock(null);typeof a=="function"&&a();this._isDocked=!1;if(this._dockNode)this._dockNode.destroy(),this._dockNode=null})}).play();this.resize(dojo.coords(this.domNode));this._onShow()},minimize:function(){this._isDocked||this.hide(dojo.hitch(this,
"_dock"))},maximize:function(){if(!this._maximized)this._naturalState=dojo.position(this.domNode),this._isDocked&&(this.show(),setTimeout(dojo.hitch(this,"maximize"),this.duration)),dojo.addClass(this.focusNode,"floatingPaneMaximized"),this.resize(dojo.window.getBox()),this._maximized=!0},_restore:function(){if(this._maximized)this.resize(this._naturalState),dojo.removeClass(this.focusNode,"floatingPaneMaximized"),this._maximized=!1},_dock:function(){if(!this._isDocked&&this.dockable)this._dockNode=
this.dockTo.addNode(this),this._isDocked=!0},resize:function(a){this._currentState=a=a||this._naturalState;var b=this.domNode.style;if("t"in a)b.top=a.t+"px";if("l"in a)b.left=a.l+"px";b.width=a.w+"px";b.height=a.h+"px";a={l:0,t:0,w:a.w,h:a.h-this.focusNode.offsetHeight};dojo.marginBox(this.canvas,a);this._checkIfSingleChild();this._singleChild&&this._singleChild.resize&&this._singleChild.resize(a)},bringToTop:function(){var a=dojo.filter(this._allFPs,function(a){return a!==this},this);a.sort(function(a,
c){return a.domNode.style.zIndex-c.domNode.style.zIndex});a.push(this);dojo.forEach(a,function(a,c){a.domNode.style.zIndex=this._startZ+c*2;dojo.removeClass(a.domNode,"dojoxFloatingPaneFg")},this);dojo.addClass(this.domNode,"dojoxFloatingPaneFg")},destroy:function(){this._allFPs.splice(dojo.indexOf(this._allFPs,this),1);this._resizeHandle&&this._resizeHandle.destroy();this.inherited(arguments)}}),dojo.declare("dojox.layout.Dock",[dijit._Widget,dijit._Templated],{templateString:'<div class="dojoxDock"><ul dojoAttachPoint="containerNode" class="dojoxDockList"></ul></div>',
_docked:[],_inPositioning:!1,autoPosition:!1,addNode:function(a){var b=dojo.create("li",null,this.containerNode),a=new dojox.layout._DockNode({title:a.title,paneRef:a},b);a.startup();return a},startup:function(){if(this.id=="dojoxGlobalFloatingDock"||this.isFixedDock)this.connect(window,"onresize","_positionDock"),this.connect(window,"onscroll","_positionDock"),dojo.isIE&&this.connect(this.domNode,"onresize","_positionDock");this._positionDock(null);this.inherited(arguments)},_positionDock:function(){this._inPositioning||
this.autoPosition=="south"&&setTimeout(dojo.hitch(this,function(){this._inPositiononing=!0;var a=dojo.window.getBox(),b=this.domNode.style;b.left=a.l+"px";b.width=a.w-2+"px";b.top=a.h+a.t-this.domNode.offsetHeight+"px";this._inPositioning=!1}),125)}}),dojo.declare("dojox.layout._DockNode",[dijit._Widget,dijit._Templated],{title:"",paneRef:null,templateString:'<li dojoAttachEvent="onclick: restore" class="dojoxDockNode"><span dojoAttachPoint="restoreNode" class="dojoxDockRestoreButton" dojoAttachEvent="onclick: restore"></span><span class="dojoxDockTitleNode" dojoAttachPoint="titleNode">${title}</span></li>',
restore:function(){this.paneRef.show();this.paneRef.bringToTop();this.destroy()}}));