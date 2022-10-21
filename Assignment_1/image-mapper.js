const IMAGE_PROP_CONTR = 'display_image_prop';
const IMAGE_CONTR = "display_upload_image";
const TOOLTIP_CLS = "charts-tooltip";
const DESC_EDITOR = '<div id="popup_window" class="modal"><div class="modal-content animate"><div class="container"><label for="description"><b>Description</b></label><input type="text" id ="input_description" placeholder="Enter description" name="description" required></div><div class="container flex-box"><button type="button" id = "save" class="loginbtn">Save</button><button type="button" id = "cancel"  class="cancelbtn">Cancel</button></div></div></div>';
const IMAGE_TABLE = 'image_tab_container';
const TABLE_HEADER = ["X Pos", "Y Pos", "Description"];
const COLUMN_KEYS = ['xPos', 'yPos', 'description'];
const TOOLTIP_ZINDEX = 10;
const SVG_CLASS = 'image_wrapper_svg';
const SVG_CONTR_ID = 'image_wrapper_svgcntr';
const SVG_GROUP_TEXT_CLS = 'image_wrapper_des_grp';
const SVG_DESCRI_TEXT_CLS = 'image_wrapper_des';
const SAVE_BTN = 'save';
const CANCEL_BTN = 'cancel';
const INPUT_DESCRIPTION = 'input_description';
/**
 * @class ImageMapper
 * @description ImageMapper class which handle application.
 */
class ImageMapper {
    /**
     * @description  class constructor
     * @param {object} args
     */
    constructor(args) {
        this.init(args);
        this.renderPlot();
    }
    /**
     * @description initialize method.
     * @method init
     * @param {object} args
     */
    init(args) {
        this.imageProp = args.imageProp || {};
        this.dataUrl = args.dataUrl || undefined;
        this.width = args.width || 500;
        this.height = args.height || 500;
        this.mousePos = {};
        this.info = [];
    }
    /**
     * @description rendering method.
     * @method renderPlot
     */
    renderPlot() {
        this.displayImageProps();
        this.renderImage();
        this.addRedDot();
        this.createTooltip();
    }
    /**
     * @description Method helps to render image properties.
     * @method displayImageProps
     */
    displayImageProps() {
        const imageProp = this.imageProp,
            keys = Object.keys(imageProp),
            propCntr = d3.select("#" + IMAGE_PROP_CONTR);
        try {
            const list = propCntr.selectAll('list')
                .data(keys)
                .enter()
                .append('li');
            list.append('span')
                .text(function (d) {
                    return d + " : " + imageProp[d];
                });
        } catch (err) {
            console.log(err.message);
        }
    }
    /**
     * @description Method helps to render image over svg.
     * @method renderImage
     */
    renderImage() {
        const me = this;
        try {
            const svg = d3.select("#" + IMAGE_CONTR)
                .append('svg')
                .attr('class', SVG_CLASS)
                .attr('id', SVG_CONTR_ID);
            this.svgGroup = svg
                .attr('width', me.width)
                .attr('height', me.height)
                .append("g")
                .attr("transform", "translate(0,0)")
                .on("click", function (event) {
                    me.showEditor({
                        x: event.pageX || event.layerX,
                        y: event.pageY || event.layerY,
                        x1: event.offsetX,
                        y1: event.offsetY
                    });
                });
            this.svgGroup.append('svg:image')
                .attr("href", me.dataUrl)
                .attr("x", 0)
                .attr("y", 0)
                .attr('width', me.width)
                .attr("height", me.height);
        } catch (err) {
            console.log(err.message);
        }
    }
    /**
     * @description Method helps to add red dot on image.
     * @method addRedDot
     */
    addRedDot() {
        const me = this,
            xPos = me.width / 2,
            yPos = me.height / 4;
        try {
            me.svgGroup.append('circle')
                .attr('cx', xPos)
                .attr('cy', yPos)
                .attr('r', '10px')
                .style('fill', 'red');
        } catch (err) {
            console.log(err.message);
        }
    }
    /**
     * @description method helps to create tooltip container
     * @method createTooltip
     */
    createTooltip() {
        const tplCntr = d3.select("." + TOOLTIP_CLS).node();
        try {
            if (tplCntr) {
                this.toolTip = d3.select("." + TOOLTIP_CLS);
            } else {
                this.toolTip = d3.select("body")
                    .append("div")
                    .attr("class", TOOLTIP_CLS)
                    .style('z-index', TOOLTIP_ZINDEX)
                    .style('display', 'none');
                this.toolTip
                    .append("span");
            }
        } catch (err) {
            console.log(err.message);
        }
    }
    /**
     * @description method helps to remove tooltip on mouse out
     * @method removeToolTip
     */
    removeToolTip() {
        d3.select('.' + TOOLTIP_CLS).style('display', 'none');
    }
    /**
     * @description To generate the tooltip data items based on config.
     * @method updateTooltip
     * @param {string} data
     * @param {Number} x
     * @param {Number} y
     */
    updateTooltip(data, x, y) {
        try {
            this.toolTip
                .style("white-space", "nowrap")
                .style('display', 'block')
                .style("left", x + "px")
                .style("top", y + "px")
                .html(data);
        } catch (err) {
            console.log(err.message);
        }
    }
    /**
     * @description mouse click description cancel event handler.
     * @method onCancel
     */
    onCancel() {
        d3.select("#desc_info").remove();
    }
    /**
     * @description mouse click description save event handler.
     * @method saveInfo
     */
    saveInfo() {
        const me = this,
            descInput = d3.select("#" + INPUT_DESCRIPTION),
            description = descInput.node().value,
            pos = me.mousePos,
            xPos = pos ? pos.x1 : 0,
            yPos = pos ? pos.y1 : 0;
        try {
            if (!this.svgText) {
                this.svgText = me.svgGroup.append('g')
                    .attr('class', SVG_GROUP_TEXT_CLS);
            }
            this.svgText.append('text')
                .attr("transform", `translate(${xPos}, ${yPos})`)
                .attr('class', SVG_DESCRI_TEXT_CLS)
                .attr("dominant-baseline", "central")
                .text(description)
                .on("mouseover", function (event) {
                    let x = event.pageX,
                        y = event.pageY,
                        data = 'description : ' + this.textContent;
                    me.updateTooltip(data, x, y);
                })
                .on("mouseout", function (event) {
                    me.removeToolTip();
                });
            if (this.info) {
                this.info.push({
                    xPos: xPos,
                    yPos: yPos,
                    description: description
                });
            }
            me.onCancel();
            me.generateTable();
        } catch (err) {
            console.log(err.message);
        }
    }
    /**
     * @description Method helps to show editor.
     * @method showEditor
     * @param {Object} pos
     */
    showEditor(pos) {
        const me = this;
        try {
            me.mousePos = pos;
            me.onCancel();
            const div = d3.create("div")
                .attr("id", "desc_info")
                .style("top", pos.y + "px")
                .style("left", pos.x + "px")
                .style("position", "absolute")
                .style("display", "block")
                .html(DESC_EDITOR);
            d3.select("body").node().appendChild(div.node());
            d3.select("#" + SAVE_BTN).on("click", () => {
                me.saveInfo();
            });
            d3.select("#" + CANCEL_BTN).on("click", () => {
                me.onCancel();
            });
        } catch (err) {
            console.log(err.message);
        }
    }
    /**
     * @description Method helps to generate table.
     * @method generateTable
     */
    generateTable() {
        const data = this.info,
            dvTable = d3.select("#" + IMAGE_TABLE);
        try {
            dvTable.selectAll("*").remove();
            const table = dvTable.append("table").
            attr("border", "1");
            const tbody = table.append('tbody');
            tbody.append('tr')
                .selectAll('th')
                .data(TABLE_HEADER).enter()
                .append('th')
                .text(function (column) {
                    return column;
                });
            const rows = tbody.selectAll('trd')
                .data(data)
                .enter()
                .append('tr');
            rows.selectAll('td')
                .data(function (row) {
                    return COLUMN_KEYS.map(function (column) {
                        return {
                            column: column,
                            value: row[column]
                        };
                    });
                })
                .enter()
                .append('td')
                .on("mouseover", function () {
                    d3.select(this).style("background-color", "powderblue");
                })
                .on("mouseout", function () {
                    d3.select(this).style("background-color", "white");
                })
                .text(function (d) {
                    return d.value;
                });
        } catch (err) {
            console.log(err.message);
        }
    }
    /**
     * @description Method helps to read file.
     * @method openFile
     * @param {Object} inputFile
     */
    static openFile(inputFile) {
        const input = inputFile.target,
            file = input.files[0],
            imageProp = {};
        imageProp['Name'] = file.name;
        imageProp['Type'] = file.type;
        try {
            const reader = new FileReader();
            reader.onload = function () {
                const dataURL = reader.result;
                let image = new Image();
                image.src = dataURL;
                image.onload = function () {
                    imageProp['Dimension'] = image.width + " * " + image.height;
                    ImageMapper.clearPanel();
                    return new ImageMapper({
                        imageProp: imageProp,
                        dataUrl: dataURL,
                        width: image.width,
                        height: image.height
                    });
                };
            };
            reader.readAsDataURL(file);
        } catch (err) {
            console.log(err.message);
        }
    }
    /**
     * @description Method helps to clear panel.
     * @method clearPanel
     */
    static clearPanel() {
        d3.select("#" + IMAGE_PROP_CONTR).selectAll("*").remove();
        d3.select("#" + IMAGE_CONTR).selectAll("*").remove();
        d3.select("#" + IMAGE_TABLE).selectAll("*").remove();
        d3.select("." + TOOLTIP_CLS).remove();
    }
}