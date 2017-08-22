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
} from 'react-native';
import PropTypes from 'prop-types';

export default class Select extends Component {
	constructor(props){
		super(props);
		this.state = {
			dataSource: [],
			isPicking: false,
			selectedRow: {},
			selectedIndex: -1,
		}

		this._openPicker = this._openPicker.bind(this);
		this._closePicker = this._closePicker.bind(this);
		this._rowPicked = this._rowPicked.bind(this);
	}

	componentDidMount(){
		this.setState(this._stateFromProps(this.props));
	}

	render(){
		return (
			<TouchableOpacity onPress={this._openPicker} activeOpacity={0.6}>
				<View>
					<Text style={this.props.styleLabel}>
						{this.props.selectLabel} <Text style={[this.props.styleLabelSelected]}>{this.state.selectedRow.label}</Text>
					</Text>
					{this.$renderModal()}
				</View>
			</TouchableOpacity>
		);
	}

	_stateFromProps(props) {
		var selectedIndex = 0;
		var dataSource = [{label:props.emptyLabel, value: null}];
		var selectedRow = {};

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

	_openPicker(){
		this.setState({isPicking: true});
	}

	_closePicker(){
		this.setState({isPicking: false});
	}

	_rowPicked(row){
		if(this.props.onChange){
			this.props.onChange.apply(this, [row]);
		}

		this.setState({isPicking: false, selectedRow:row});
	}

	$renderModal(){
		var title = null;
		if(this.props.title){
			title = <Text style={[styles.title]}>{this.props.title}</Text>
		}

		return (
			<Modal visible={this.state.isPicking} animationType={this.props.animationType} transparent={true} onRequestClose={this._closePicker}>
				<TouchableWithoutFeedback onPress={this._closePicker}>
					<View style={styles.modalBg}>
						<View style={styles.listContainer}>
							{title}
							<ScrollView>
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
				<TouchableHighlight key={index} onPress={()=>this._rowPicked(row)} underlayColor={this.props.underlayColor}>
					<View style={[styles.row, this.props.styleRow, this._getSelectedClass(row)]}>
						<Text style={[styles.textRow, this.props.styleTextRow]}>{row.label}</Text>
					</View>
				</TouchableHighlight>
			);
		});
	}

	_getSelectedClass(item){
		var isSelected = this.state.selectedRow.value && this.state.selectedRow.value==item.value;
		var selectedClass = {};
		if(isSelected){
			selectedClass.backgroundColor = this.props.selectedColor;
		}

		return selectedClass;
	}

	getSelectedValue(){
		return this.state.selectedRow.value;
	}

	getSelectedItem(){
		return this.state.selectedRow;
	}
}

const stylePropType = PropTypes.oneOfType([
	PropTypes.number,
	PropTypes.object,
	PropTypes.array,
]);

Select.defaultProps = {
	dataSource: [],
	selectLabel: '-- Select --',
	emptyLabel: '-- ',
	title: null,

	animationType: 'fade',
	underlayColor: '#EDEDEF',
	selectedColor: '#BFBFBF',
	selected: null,

	onChange: null,
}

Select.propTypes = {
	selected: PropTypes.any,
	emptyLabel: PropTypes.string,
	dataSource: PropTypes.array,
	selectLabel: PropTypes.string,
	title: PropTypes.string,

	animationType: PropTypes.oneOf(['fade', 'slide', 'none']),
	underlayColor: PropTypes.string,
	selectedColor: PropTypes.string,

	onChange: PropTypes.func,

	styleRow: stylePropType,
	styleTextRow: stylePropType,
	styleLabel: stylePropType,
	styleLabelSelected: stylePropType,
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

const styles = StyleSheet.create({
	title: {
		fontSize: 17,
		padding: 8,
		marginTop: 4,
	},

	listContainer: {
		flex:1,
		backgroundColor: '#FFF',
		marginHorizontal: 50,
		marginVertical: 40,
	},

	modalBg: {
		flex: 1,
		backgroundColor: '#0008',
	},

	row: {
		padding: 10,
		justifyContent: 'center',
		alignItems: 'flex-start',
		borderStyle: 'solid',
		borderBottomWidth: 1,
		borderBottomColor: '#D8D8D8',
	},

	textRow: {
		fontSize: 13,
		color: '#000',
	}
});
