const KEY_LOW = "3. low";
const KEY_HIGH = "2. high";
const KEY_CLOSE = "4. close";
const KEY_PLOT = "Time Series (60min)";
const DATE = 'date';
const DD_BOX = 'symbol_search_select';
const INPUT = "symbol_search_input";
const IBM = 'IBM';
const KEY_SYMBOL = "1. symbol";
const KEYWORD_SEARCH_URL = "https://www.alphavantage.co/query?function=SYMBOL_SEARCH&apikey=JZ4K6RNO4Z98YE3Y&keywords=";
const SYMBOL_SEARCH_URL = "https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&interval=60min&apikey=JZ4K6RNO4Z98YE3Y&symbol=";
const TOOLTIP_CFG = {
    "Open": "1. open",
    "High": "2. high",
    "Low": "3. low",
    "Close": "4. close",
    "Volume": "5. volume"
};
const HIGH_COLOR = '#008000';
const LOW_COLOR = '#FF0000';
const CLOSE_COLOR = '#03a9f4';
const COMBO_DEFAULT = [{
    "1. symbol": "Choose Symbol",
    "2. name": "Choose Symbol",
    "3. type": "Choose Symbol",
    "4. region": "Choose Symbol",
    "5. marketOpen": "09:30",
    "6. marketClose": "16:00",
    "7. timezone": "UTC-04",
    "8. currency": "USD",
    "9. matchScore": "0.00"
}, {
    "1. symbol": "IBM",
    "2. name": "International Business Machines Corp",
    "3. type": "Equity",
    "4. region": "United States",
    "5. marketOpen": "09:30",
    "6. marketClose": "16:00",
    "7. timezone": "UTC-04",
    "8. currency": "USD",
    "9. matchScore": "1.0000"
}];
const SVG_CLASS = 'line_chart_svg';
const SVG_CONTR_ID = 'line_chart_svg_cntr';
const CHART_THEME_COLOR = '#ffffff';
const CHART_GRP = 'charts-grp-';
const CHART_CLIP = 'charts-clip-';
const DEFS_GRP = 'defs_grp_';
const RADIUS = 5;
const TOOLTIP_CLS = "charts-tooltip";
const TOOLTIP_ZINDEX = 10;
const CIRCLE_STROKE = '#000000';
const Y_AXIS_TITLE = 'Stock Price';
const X_AXIS_TITLE = 'Date';
const SYMBOL_NAME = '2. name';
const SPLITTER = '::';
/**
 * @class StockChart
 * @description StockChart class which handle application.
 */
class StockChart {
    /**
     * @description  class constructor
     * @param {object} args
     */
    constructor(args) {
        this.init(args);
        this.setData();
        this.plotChart();
    }
    /**
     * @description initialize method.
     * @method init
     * @param {object} args
     */
    init(args) {
        this.divId = args.divId || 'charts';
        this.data = args.data || {};
        this.width = args.width || 1000;
        this.height = args.height || 600;
        this.symbolName = args.symbolName || 'Graph';
        this.margin = {
            top: 60,
            right: 30,
            bottom: 60,
            left: 70
        };
        this.plotData = this.data[KEY_PLOT];
    }
    /**
     * @description method helps to plot chart.
     * @method plotChart
     */
    plotChart() {
        try {
            this.setSVG();
            this.setScale();
            this.setAxis();
            this.drawChart();
            this.setChartTitle();
            this.createTooltip();
            this.tpl = this.genTplString(TOOLTIP_CFG);
        } catch (err) {
            console.log(err.message);
        }
    }
    /**
     * @description method helps to set data and other configs.
     * @method setData
     */
    setData() {
        const me = this,
            plotData = Object.keys(me.plotData);
        try {
            const data = plotData.map(function (d) {
                let date = new Date(d);
                return {
                    value: d,
                    date: date.getDate(),
                    time: date.getTime()
                };
            });
            const uniqueRecords = [
                ...new Map(data.map((item) => [item[DATE], item])).values(),
            ];
            const uniqueData = uniqueRecords.map(function (d) {
                return d.value;
            });
            let dataPoints = uniqueData.length > 10 ? uniqueData.slice(0, 10) : uniqueData;
            this.xVals = dataPoints.sort(function (a, b) {
                return new Date(a).getTime() - new Date(b).getTime();
            });
            this.chartData = this.xVals.map(function (d) {
                let obj = me.plotData[d];
                obj.date = d;
                return obj;
            });
            const low = this.chartData.map(function (d) {
                return Number(d[KEY_LOW]);
            });
            const high = this.chartData.map(function (d) {
                return Number(d[KEY_HIGH]);
            });
            this.yVals = [...low, ...high];
        } catch (err) {
            console.log(err.message);
        }
    }
    /**
     * @description method helps to set svg to container.
     * @method setSVG
     */
    setSVG() {
        const me = this,
            margin = me.margin,
            left = margin ? margin.left : 0,
            top = margin ? margin.top : 0;
        try {
            const svg = d3.select("#" + me.divId)
                .append('svg')
                .attr('class', SVG_CLASS)
                .attr('id', SVG_CONTR_ID);
            svg.append("rect")
                .attr("x", 0)
                .attr("y", 0)
                .attr("height", me.height)
                .attr("width", me.width)
                .attr("class", "charts-boundary-rect")
                .style("fill", CHART_THEME_COLOR);
            this.svgGroup = svg
                .attr('width', me.width)
                .attr('height', me.height)
                .append("g")
                .attr("transform", `translate(${left}, ${top})`);
        } catch (err) {
            console.log(err.message);
        }
    }
    /**
     * @description method helps to set x, y scale for chart
     * @method setScale
     */
    setScale() {
        const me = this,
            margin = me.margin,
            domainX = me.xVals,
            domainY = d3.extent(me.yVals),
            left = margin ? margin.left : 0,
            right = margin ? margin.right : 0,
            top = margin ? margin.top : 0,
            bottom = margin ? margin.bottom : 0;
        try {
            this.chartWidth = me.width - (left + right);
            this.chartHeight = me.height - (top + bottom);
            this.xScale = d3.scaleBand()
                .domain(domainX)
                .range([10, this.chartWidth - 10])
                .padding(0.1);
            this.yScale = d3.scaleLinear()
                .domain(domainY)
                .range([this.chartHeight - 5, 10])
                .nice();
        } catch (err) {
            console.log(err.message);
        }
    }
    /**
     * @description method helps to set axis to chart.
     * @method setAxis
     */
    setAxis() {
        const me = this,
            height = me.chartHeight || 0,
            yPos = me.margin ? me.margin.bottom - 10 : 0,
            xMid = me.chartWidth ? (me.chartWidth / 2) : 0;
        try {
            let txtpos = me.getTextWidth(X_AXIS_TITLE),
                lblMid = txtpos ? (txtpos / 2) : 0,
                posX = xMid - lblMid,
                posY = height ? (height + yPos) : 0,
                heightMid = height ? (height / 2) : 0;
            me.svgGroup.append("g")
                .attr('class', 'charts-axis-x')
                .attr("transform", `translate(0, ${me.chartHeight})`)
                .call(d3.axisBottom(me.xScale));
            me.svgGroup.append("text")
                .attr("transform", `translate(${posX}, ${posY})`)
                .attr('class', 'charts-axis-title')
                .style("cursor", "pointer")
                .text(X_AXIS_TITLE);

            txtpos = me.getTextWidth(Y_AXIS_TITLE);
            lblMid = txtpos ? (txtpos / 2) : 0;
            posY = me.margin ? (-me.margin.left + 10) : 0;
            posX = (heightMid + lblMid);

            if (posX > height) {
                posX = height;
            }
            me.svgGroup.append("g")
                .attr('class', 'charts-axis-y')
                .attr("transform", "translate( 0, 0)")
                .call(d3.axisLeft(me.yScale));
            me.svgGroup.append("text")
                .attr("transform", "rotate(-90)")
                .attr("y", posY)
                .attr("x", -(posX))
                .attr("dy", "1em")
                .attr('class', 'charts-axis-title')
                .style("cursor", "pointer")
                .text(Y_AXIS_TITLE);
        } catch (err) {
            console.log(err.message);
        }
    }
    /**
     * @description Method helps to set clip path region for chart
     * @method setClipPath
     */
    setClipPath() {
        const me = this,
            svg = me.svgGroup;
        try {
            if (me[DEFS_GRP + me.divId]) {
                d3.select("#" + CHART_GRP + me.divId).remove();
            } else {
                let def = svg.append("defs");
                def.append("clipPath")
                    .attr("id", CHART_CLIP + me.divId)
                    .append("rect")
                    .attr("x", 0)
                    .attr("y", 0)
                    .attr("width", me.chartWidth)
                    .attr("height", me.chartHeight);
            }
            me[DEFS_GRP + me.divId] = svg.append("g")
                .attr("id", CHART_GRP + me.divId)
                .attr("clip-path", `url(#${CHART_CLIP + me.divId})`);
        } catch (err) {
            console.log(err.message);
        }
    }
    /**
     * @description method helps to render chart.
     * @method drawChart
     */
    drawChart() {
        const me = this;
        try {
            me.setClipPath();
            /*render low line*/
            me.drawLine({
                color: LOW_COLOR,
                xIndex: DATE,
                yIndex: KEY_LOW
            });
            /*render high line*/
            me.drawLine({
                color: HIGH_COLOR,
                xIndex: DATE,
                yIndex: KEY_LOW
            });
            /*render close line*/
            me.drawLine({
                color: CLOSE_COLOR,
                xIndex: DATE,
                yIndex: KEY_CLOSE
            });
        } catch (err) {
            console.log(err.message);
        }
    }
    /**
     * @description method helps to render line path.
     * @method drawLine
     * @param {Object} config
     */
    drawLine(config) {
        const me = this,
            data = me.chartData,
            color = config.color;
        try {
            me[DEFS_GRP + me.divId].append("path")
                .data([data])
                .attr("class", "charts-line")
                .attr("d", me.drawPath(config))
                .style("stroke", color)
                .style("fill", "none")
                .style("stroke-dasharray", "0, 0")
                .style("stroke-width", "1px");
            me.drawCircle(config);
        } catch (err) {
            console.log(err.message);
        }
    }
    /**
     * @description method helps to render line.
     * @method drawPath
     * @param {Object} config
     */
    drawPath(config) {
        const me = this,
            xScale = me.xScale,
            yScale = me.yScale,
            xIndex = config.xIndex,
            yIndex = config.yIndex,
            bw = xScale.bandwidth() / 2;
        try {
            return d3.line()
                .x(function (d) {
                    let xPos = xScale(d[xIndex]) + bw;
                    return xPos >= 0 ? xPos : NaN;
                })
                .y(function (d) {
                    return yScale(d[yIndex]);
                });
        } catch (err) {
            console.log(err.message);
        }
    }
    /**
     * @description method helps to render circle.
     * @method drawCircle
     * @param {Object} config
     */
    drawCircle(config) {
        const me = this,
            data = me.chartData,
            xScale = me.xScale,
            yScale = me.yScale,
            xIndex = config.xIndex,
            yIndex = config.yIndex,
            bw = xScale.bandwidth() / 2,
            color = config.color;
        try {
            me[DEFS_GRP + me.divId].selectAll("dot")
                .data(data)
                .enter().append("circle")
                .attr("r", RADIUS)
                .style("fill", color)
                .style("stroke", CIRCLE_STROKE)
                .attr("cx", function (d) {
                    let xPos = xScale(d[xIndex]) + bw;
                    return xPos >= 0 ? xPos : NaN;
                })
                .attr("cy", function (d) {
                    return yScale(d[yIndex]);
                })
                .on('mouseover', function (ev, d) {
                    d3.select(this).transition()
                        .duration('100')
                        .attr("r", 8);
                    let xPos = ev.pageX,
                        yPos = ev.pageY;
                    me.updateTooltip(xPos, yPos, d);
                })
                .on('mouseout', function (d, i) {
                    d3.select(this).transition()
                        .duration('200')
                        .attr("r", RADIUS);
                    me.removeToolTip();
                });
        } catch (err) {
            console.log(err.message);
        }
    }
    /**
     * @description method helps to set title for chart.
     * @method setChartTitle
     */
    setChartTitle() {
        const symbolName = this.symbolName,
            txtpos = this.getTextWidth(symbolName),
            lblMid = txtpos ? (txtpos / 2) : 0,
            xMid = this.chartWidth ? (this.chartWidth / 2) : 0,
            xPos = xMid - lblMid,
            yPos = -10;
        try {
            this.svgGroup.append("text")
                .attr("transform", `translate(${xPos}, ${yPos})`)
                .attr('class', 'charts-title')
                .style("cursor", "pointer")
                .text(symbolName);
        } catch (err) {
            console.log(err.message);
        }
    }
    /**
     * @description method helps to create tooltip container
     * @method createTooltip
     */
    createTooltip() {
        const tooltipDiv = d3.select("." + TOOLTIP_CLS).node();
        try {
            if (tooltipDiv) {
                this.toolTip = d3.select("." + TOOLTIP_CLS);
            } else {
                this.toolTip = d3.select("body")
                    .append("div")
                    .attr("class", TOOLTIP_CLS)
                    .style('z-index', TOOLTIP_ZINDEX)
                    .style('display', 'none');
                this.toolTip
                    .append("table")
                    .attr('class', 'pc-table-tooltip')
                    .append("tbody");
            }
        } catch (err) {
            console.log(err.message);
        }
    }
    /**
     * @description method helps to remove tooltip on mouse over.
     * @method removeToolTip
     */
    removeToolTip() {
        d3.select("." + TOOLTIP_CLS).style('display', 'none');
    }
    /**
     * @description To generate the tooltip data items based on config.
     * @method updateTooltip
     * @param {Number} x
     * @param {Number} y
     * @param {Object} data
     */
    updateTooltip(x, y, data) {
        const me = this,
            tplStr = me.tpl || "";
        try {
            if (data) {
                let displayData = "";
                if (data.constructor === Object) {
                    displayData += me.generateTplData(data, tplStr);
                }
                if (displayData) {
                    let result = '';
                    displayData.split('<br>').forEach(function (d) {
                        if (d.trim().length) {
                            let dataSet = d.split('::'),
                                dataLen = dataSet.length,
                                dataVal = dataSet[dataLen - 1];
                            if (dataLen > 1) {
                                result += '<tr>';
                                dataSet.forEach(function (kx, i) {
                                    kx = kx.replace("<b>undefined</b>", "");
                                    result += (i == 0) ? ('<td>' + kx + '</td>') + ('<td>' + ':' + '</td>') : ('<td>' + kx + '</td>');
                                });
                                result += '</tr>';
                            } else if (dataLen === 1) {
                                result += '<tr> <td>' + dataVal + '</td> <tr>';
                            }
                        }
                    });
                    this.toolTip
                        .style("width", "auto")
                        .style("white-space", "nowrap")
                        .style("left", x + "px")
                        .style("top", y + "px")
                        .style("font-size", '10px')
                        .style('line-height', '12px')
                        .style('display', 'block')
                        .select("table")
                        .html(result);
                }
            }
        } catch (err) {
            console.log(err.message);
        }
    }
    /**
     * @description To generate updated tooltip string.
     * @method generateTplData
     * @param {Object} data
     * @param {String} tpl
     */
    generateTplData(data, tpl) {
        let res = "",
            value = "";
        do {
            let start = tpl.search("{"),
                end = tpl.search("}");
            if (start == -1 || end == -1) {
                res += tpl.substring(0, tpl.length);
                tpl = "";
            } else {
                let tplKey = tpl.substring(start + 1, end);
                res += tpl.substring(0, start);
                value = data[tplKey];
                if (value) {
                    res += value;
                }
                tpl = tpl.substring(end + 1, tpl.length);
            }
        } while (tpl.length > 0);
        return res + " " + tpl;
    }
    /**
     * @description To generate tooltip string for chart.
     * @method genTplString
     * @param {Object} config
     */
    genTplString(config) {
        let tplStr = '',
            key;
        try {
            for (key in config) {
                if (config.hasOwnProperty(key)) {
                    tplStr = (tplStr + key + SPLITTER) + (`<b>{${config[key]}}</b><br>`);
                }
            }
            return tplStr;
        } catch (err) {
            console.log(err.message);
        }
    }
    /**
     *	@description Method to get the text width
     *	@method getTextWidth
     *	@param	{String} text
     */
    getTextWidth(text) {
        let tag = document.createElement("div"),
            resultWidth;
        try {
            tag.style.position = "absolute";
            tag.style.left = "-999em";
            tag.style.whiteSpace = "nowrap";
            tag.innerHTML = text;
            document.body.appendChild(tag);
            resultWidth = tag.clientWidth;
            document.body.removeChild(tag);
            return resultWidth;
        } catch (err) {
            console.log(err.message);
        }
    }
    /**
     * @description Method to fetch symbols based on keyword.
     * @method getSymbols
     * @param {String} url
     */
    static getSymbols(url) {
        const me = this;
        try {
            fetch(url)
                .then(result => result.json())
                .then(data => {
                    if (data && data.bestMatches) {
                        me.addSymbols(data.bestMatches);
                    }
                }).catch((error) => {
                    console.error('Error:', error);
                });
        } catch (err) {
            console.log(err.message);
        }
    }
    /**
     * @description Method helps to add symbols to drop down box.
     * @method addSymbols
     * @param {Array} data
     */
    static addSymbols(data) {
        let options = COMBO_DEFAULT.slice();
        try {
            d3.select("#" + DD_BOX).selectAll("*").remove();
            if (data.length) {
                data.forEach(function (d) {
                    let symbol = d[KEY_SYMBOL];
                    if (symbol != IBM) {
                        options.push(d);
                    }
                });
                this.addOptions(options);
            }
        } catch (err) {
            console.log(err.message);
        }
    }
    /**
     * @description Method to search symbols based on keyword.
     * @method searchSymbol
     */
    static searchSymbol() {
        const input = d3.select("#" + INPUT),
            keyword = input.node && input.node().value || undefined;
        try {
            if (keyword) {
                let url = KEYWORD_SEARCH_URL + keyword;
                this.getSymbols(url);
            }
        } catch (err) {
            console.log(err.message);
        }
    }
    /**
     * @description Method helps to get data for the symbol.
     * @method getStockData
     */
    static getStockData() {
        const me = this,
            ddb = d3.select("#" + DD_BOX);
        try {
            let symbol = ddb.property('value'),
                selectedIndex = ddb.property('selectedIndex');
            if (selectedIndex && symbol) {
                let url = SYMBOL_SEARCH_URL + symbol,
                    selNode = ddb.node(),
                    symbolInfo;
                if (selNode && selNode.options && selNode.options.length) {
                    let info = selNode.options[selectedIndex];
                    symbolInfo = info && info.text;
                } else {
                    symbolInfo = symbol;
                }
                fetch(url)
                    .then(result => result.json())
                    .then(data => {
                        if (data.hasOwnProperty(KEY_PLOT)) {
                            let container = document.querySelector("#chart"),
                                width = 0,
                                height = 0;
                            if (container) {
                                width = container.clientWidth - 80;
                                height = container.clientHeight - 50;
                            }
                            me.clearPanel();
                            return new StockChart({
                                data: data,
                                divId: "chart",
                                width: width,
                                height: height,
                                symbolName: symbolInfo
                            });
                        } else {
                            alert(JSON.stringify(data));
                            console.error('Error:', JSON.stringify(data));
                        }
                    })
                    .catch((error) => {
                        console.error('Error:', error);
                    });
            }
        } catch (err) {
            console.log(err.message);
        }
    }
    /**
     * @description Method helps to add options dynamically to drop down box.
     * @method addOptions
     * @param {Array} data
     */
    static addOptions(data) {
        try {
            d3.select("#" + DD_BOX)
                .selectAll("option")
                .data(data)
                .enter().append("option")
                .attr("value", function (d) {
                    return d[KEY_SYMBOL];
                })
                .attr("cfg", function (d) {
                    return d;
                })
                .text(function (d) {
                    return d[SYMBOL_NAME];
                });
        } catch (err) {
            console.log(err.message);
        }
    }
    /**
     * @description Method helps to clear chart.
     * @method clearPanel
     */
    static clearPanel() {
        d3.select("#chart").selectAll("*").remove();
        d3.select("." + TOOLTIP_CLS).remove();
    }
}