/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/


dojo._hasResource["dojox.charting.plot2d.Base"]||(dojo._hasResource["dojox.charting.plot2d.Base"]=!0,dojo.provide("dojox.charting.plot2d.Base"),dojo.require("dojox.charting.scaler.primitive"),dojo.require("dojox.charting.Element"),dojo.require("dojox.charting.plot2d.common"),dojo.require("dojox.charting.plot2d._PlotEvents"),dojo.declare("dojox.charting.plot2d.Base",[dojox.charting.Element,dojox.charting.plot2d._PlotEvents],{constructor:function(){this.zoom=null;this.zoomQueue=[];this.lastWindow={vscale:1,
hscale:1,xoffset:0,yoffset:0}},clear:function(){this.series=[];this._vAxis=this._hAxis=null;this.dirty=!0;return this},setAxis:function(a){a&&(this[a.vertical?"_vAxis":"_hAxis"]=a);return this},addSeries:function(a){this.series.push(a);return this},getSeriesStats:function(){return dojox.charting.plot2d.common.collectSimpleStats(this.series)},calculateAxes:function(a){this.initializeScalers(a,this.getSeriesStats());return this},isDirty:function(){return this.dirty||this._hAxis&&this._hAxis.dirty||
this._vAxis&&this._vAxis.dirty},isDataDirty:function(){return dojo.some(this.series,function(a){return a.dirty})},performZoom:function(a,b){var e=this._vAxis.scale||1,f=this._hAxis.scale||1,g=a.height-b.b,c=this._hScaler.bounds,c=(c.from-c.lower)*c.scale,d=this._vScaler.bounds,d=(d.from-d.lower)*d.scale;rVScale=e/this.lastWindow.vscale;rHScale=f/this.lastWindow.hscale;rXOffset=(this.lastWindow.xoffset-c)/(this.lastWindow.hscale==1?f:this.lastWindow.hscale);rYOffset=(d-this.lastWindow.yoffset)/(this.lastWindow.vscale==
1?e:this.lastWindow.vscale);shape=this.group;anim=dojox.gfx.fx.animateTransform(dojo.delegate({shape:shape,duration:1200,transform:[{name:"translate",start:[0,0],end:[b.l*(1-rHScale),g*(1-rVScale)]},{name:"scale",start:[1,1],end:[rHScale,rVScale]},{name:"original"},{name:"translate",start:[0,0],end:[rXOffset,rYOffset]}]},this.zoom));dojo.mixin(this.lastWindow,{vscale:e,hscale:f,xoffset:c,yoffset:d});this.zoomQueue.push(anim);dojo.connect(anim,"onEnd",this,function(){this.zoom=null;this.zoomQueue.shift();
this.zoomQueue.length>0&&this.zoomQueue[0].play()});this.zoomQueue.length==1&&this.zoomQueue[0].play();return this},render:function(){return this},getRequiredColors:function(){return this.series.length},initializeScalers:function(a,b){this._hAxis?(this._hAxis.initialized()||this._hAxis.calculate(b.hmin,b.hmax,a.width),this._hScaler=this._hAxis.getScaler()):this._hScaler=dojox.charting.scaler.primitive.buildScaler(b.hmin,b.hmax,a.width);this._vAxis?(this._vAxis.initialized()||this._vAxis.calculate(b.vmin,
b.vmax,a.height),this._vScaler=this._vAxis.getScaler()):this._vScaler=dojox.charting.scaler.primitive.buildScaler(b.vmin,b.vmax,a.height);return this}}));