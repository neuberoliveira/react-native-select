/**
 * @flow
 */

import React, { Component } from 'react';
import {
	View,
	Text,
	ScrollView,
	Modal,
	StyleSheet,
	TouchableHighlight,
	TouchableOpacity,
	TouchableWithoutFeedback,
	Dimensions,
} from 'react-native';
import PropTypes from 'prop-types';

const dimension = Dimensions.get('window');
const windowWidth:number = dimension.width;
const windowHeight:number = dimension.height;
export default class Select extends Component {
	static marginVertical:number = 0;
	static marginHorizontal:number = 0;
	static MODE_FIXED = 'fixed';
	static MODE_ADAPTATIVE = 'adaptative';
	
	static MODE_SELECTED_APPEND = 'append'; 
	static MODE_SELECTED_REPLACE = 'replace';

	constructor(props){
		super(props);
		this.state = {
			dataSource: [],
			isPicking: false,
			selectedRow: {},
			selectedIndex: -1,
			containerLayout: null,
		}

		this._openPicker = this._openPicker.bind(this);
		this._closePicker = this._closePicker.bind(this);
		this._onChange = this._onChange.bind(this);
		
		this._onListContainerLayout = this._onListContainerLayout.bind(this);
		this._getModalContainerStyle = this._getModalContainerStyle.bind(this);
		this._getListContainerStyle = this._getListContainerStyle.bind(this);
		this._getListAdaptativeStyle = this._getListAdaptativeStyle.bind(this);
		this._getListFixedStyle = this._getListFixedStyle.bind(this);

		Select.marginVertical = ((windowHeight/100)*5);
		Select.marginHorizontal = ((windowWidth/100)*8);
	}

	componentDidMount(){
		this.setState(this._stateFromProps(this.props));
	}

	render(){
		return (
			<TouchableOpacity onPress={this._openPicker} activeOpacity={0.6}>
				<View>
					{this.$renderLabel()}
					{this.$renderModal()}
				</View>
			</TouchableOpacity>
		);
	}

	_stateFromProps(props) {
		var selectedIndex = 0;
		var dataSource = [];
		var selectedRow = {};

		if(props.allowEmpty){
			dataSource.push({label:props.emptyLabel, value: null});
		}

		React.Children.toArray(props.children).forEach((child, index)=>{
			if (child.props.value === props.selected) {
				selectedIndex = index;
				selectedRow = child.props;
			}
			dataSource.push({
				value: child.props.value,
				label: child.props.label,
			});
		});
		return {dataSource, selectedRow, selectedIndex};
	}

	$renderLabel(){
		var view = null;
		var displayLabel = null;
		var labelStyleDefault = styles.label;
		var labelStyleUser = this.props.styleLabel;
		var labelSelected = [styles.labelSelected, this.props.styleLabelSelected];
		
		if(!this.state.selectedRow.value || this.state.selectedRow.value==null || typeof this.state.selectedRow.value=='undefined'){
			view = (<Text style={[labelStyleDefault, labelStyleUser]}>{this.props.placeholder}</Text>);
		}else{
			if(this.props.selectedMode==Select.MODE_SELECTED_REPLACE){
				view = (
					<Text style={[labelStyleDefault, labelStyleUser, labelSelected]}>
						{this.state.selectedRow.label}
					</Text>
				);
			}else{
				view = (
					<Text style={[labelStyleDefault, labelStyleUser]}>
						{this.props.placeholder}
						<Text style={labelSelected}>{this.state.selectedRow.label}</Text>
					</Text>
				);
			}
		}
		
		return view;
	}

	$renderModal(){
		var title = null;
		if(this.props.title){
			title = <Text style={[styles.title]}>{this.props.title}</Text>
		}

		return (
			<Modal visible={this.state.isPicking} animationType={this.props.animationType} transparent={true} onRequestClose={this._closePicker}>
				<TouchableWithoutFeedback onPress={this._closePicker}>
					<View style={[styles.modalContainer, this._getModalContainerStyle()]}>
						<View style={[styles.listContainer, this._getListContainerStyle()]} onLayout={this._onListContainerLayout}>
							{title}
							<ScrollView scrollEnabled={this.props.mode==Select.MODE_FIXED}>
								{this.$renderDataSource()}
							</ScrollView>
						</View>
					</View>
				</TouchableWithoutFeedback>
			</Modal>
		)
	}

	$renderDataSource(){
		return this.state.dataSource.map((row, index)=>{
			return (
				<TouchableHighlight key={index} onPress={()=>this._onChange(row)} underlayColor={this.props.underlayColor}>
					<View style={[styles.rowContainer, this.props.styleRowContainer]}>
						<Text style={[styles.row, styles.textRow, this.props.styleRow, this._getSelectedClass(row)]}>{row.label}</Text>
					</View>
				</TouchableHighlight>
			);
		});
	}

	_openPicker(){
		this.setState({isPicking: true});
	}

	_closePicker(){
		this.setState({isPicking: false});
	}

	_onChange(row){
		if(this.props.onChange){
			this.props.onChange.apply(this, [row]);
		}

		this.setState({isPicking: false, selectedRow:row});
	}

	_getSelectedClass(item){
		var isSelected = this.state.selectedRow.value && this.state.selectedRow.value==item.value;
		var selectedClass = {};
		if(isSelected){
			if(this.props.selectedStyle)
				selectedClass = this.props.selectedStyle;
			else
				selectedClass = styles.selectedRow;
		}

		return selectedClass;
	}

	_onListContainerLayout(evt){
		if(!this.state.containerLayout)
			this.setState({containerLayout:evt.nativeEvent.layout});
	}

	_getModalContainerStyle(){
		if(this.props.mode==Select.MODE_FIXED){
			return {}
		}else{
			return {
				alignItems:'center',
			}
		}
	}

	_getListContainerStyle(){
		var style = {};
		if(this.props.mode==Select.MODE_FIXED){
			style = this._getListFixedStyle();
		}else{
			style = this._getListAdaptativeStyle();
		}

		return style;
	}

	_getListFixedStyle(){
		return {
			flex: 1,
			marginHorizontal: Select.marginHorizontal,
			marginVertical: Select.marginVertical,
		};
	}

	_getListAdaptativeStyle(){
		const maxHeight = windowHeight - Select.marginVertical;
		if(this.rowsHeight >= maxHeight){
			return this._getListFixedStyle();
		}else{
			var style = {
				justifyContent:'center',
				//alignItems:'center',
			}

			if(this.state.containerLayout){
				style.width = this.state.containerLayout.width+30;
			}else{
				style = this._getListFixedStyle();
			}

			return style;
		}
	}

	getSelectedValue(){
		return this.state.selectedRow.value;
	}

	getSelectedItem(){
		return this.state.selectedRow;
	}
}

/**
 * Row Component
 */
Select.Row = class extends Component {
	static propTypes = {
		value: PropTypes.any,
		label: PropTypes.string,
	};

	render() {
		throw null;
	}
}

//Props
const stylePropType = PropTypes.oneOfType([
	PropTypes.number,
	PropTypes.object,
	PropTypes.array,
]);

Select.defaultProps = {
	placeholder: '-- Select --',
	title: null,

	selected: null,
	dataSource: [],

	allowEmpty: false,
	emptyLabel: '-- ',

	mode: Select.MODE_FIXED,
	selectedMode: Select.MODE_SELECTED_REPLACE,

	animationType: 'fade',
	underlayColor: '#EDEDEF',

	onChange: null,
}

Select.propTypes = {
	placeholder: PropTypes.string,
	title: PropTypes.string,

	selected: PropTypes.any,
	dataSource: PropTypes.array,
	
	allowEmpty: PropTypes.bool,
	emptyLabel: PropTypes.string,
	
	mode: PropTypes.oneOf([Select.MODE_FIXED, Select.MODE_ADAPTATIVE]),
	selectedMode: PropTypes.oneOf([Select.MODE_SELECTED_APPEND, Select.MODE_SELECTED_REPLACE]),

	animationType: PropTypes.oneOf(['fade', 'slide', 'none']),
	underlayColor: PropTypes.string,
	
	styleRowContainer: stylePropType,
	styleRow: stylePropType,
	styleLabel: stylePropType,
	styleLabelSelected: stylePropType,

	onChange: PropTypes.func,
}


//Style
const styles = StyleSheet.create({
	title: {
		fontSize: 17,
		padding: 8,
		marginTop: 4,
	},

	listContainer: {
		backgroundColor: '#FFF',
	},

	modalContainer: {
		flex: 1,
		backgroundColor: '#0008',
		justifyContent:'center',
	},

	label: {},

	rowContainer: {
		borderStyle: 'solid',
		borderBottomWidth: 1,
		borderBottomColor: '#D8D8D8',
	},

	row: {
		flex:1,
		padding: 10,
		justifyContent: 'center',
		alignItems: 'flex-start',
		fontSize: 13,
		color: '#000',
	},


	selectedRow: {
		backgroundColor: '#EEE',
	},

	labelSelected: {},
});
