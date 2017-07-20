import React, { Component } from 'react';
import { Row, Col } from 'react-flexbox-grid';
import '../assets/css/GroupButtons.css';
import { connect } from 'react-redux';
import { setCurrency, setCurrencyAction } from '../actions/CurrencyAction';
import { getDistributedDataFromDataset } from '../utils.js';

class CurrencyButton extends Component {
  constructor() {
    super();
    this.state = {
      currencyActiveClass: 'EUR',
      exchangeRateDate: new Date(),
      exchangeRateActiveClass: 'NOW',
    };
  }

  static mapButtonKeysToText(key) {
    const map = {
      NOW: 'Now',
      END: 'Day of ICO end',
    };
    return map[key];
  }

  onCurrencyHandle(currency, dayClass) {
    dayClass = dayClass || this.state.exchangeRateActiveClass || 'NOW';
    let rateDate = null;
    switch (dayClass) {
      case 'END':
        rateDate = this.props.stats.time.endDate;
        break;
      case 'NOW':
        rateDate = new Date();
        break;
    }
    currency = currency || this.props.currency;
    this.props.setCurrency(currency, rateDate);
    this.setState({ exchangeRateActiveClass: dayClass, exchangeRateDate: rateDate, currencyActiveClass: currency });
    const currentStatistics = this.props.stats;
    const distribution = getDistributedDataFromDataset(currentStatistics.etherDataset, this.props.currencyValue);
    currentStatistics.charts.investorsDistribution = distribution[0];
    currentStatistics.charts.investmentDistribution = distribution[1];
    this.props.drawStatistics(currentStatistics);
  }

  render() {
    return (
      <div>
        <Row className="group-buttons">
          <Col>
            <div>
              <p>Convert to:</p>
              <ul className="currency-buttons">
                {['EUR', 'USD', 'ETH'].map(item => (<li key={item}><a
                  className={this.state.currencyActiveClass === item ? 'active' : ''}
                  onClick={() => {
                    this.onCurrencyHandle(item, null);
                  }}
                >{item}</a></li>))}
              </ul>
              <p>Rate from:</p>
              <ul className="currency-buttons">
                {['NOW', 'END'].map(item =>
                  (<li key={item}><a
                    className={this.state.exchangeRateActiveClass === item ? 'active' : ''}
                    onClick={
                              () => {
                                this.onCurrencyHandle(null, item);
                              }
                            }>
                    {CurrencyButton.mapButtonKeysToText(item)}</a></li>)
                  )
                }
              </ul>
            </div>
          </Col>
          <Col md={6} className="exchangeRate">
            <p>
              <strong>ETH 1 = {this.props.currency} {this.props.currencyValue}</strong>
              <br/>
              <small>https://api.coinbase.com/v2/prices/ on {this.state.exchangeRateDate.formatDate()}</small>
            </p>
          </Col>
        </Row>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  currency: state.currency.currency,
  currencyValue: state.currency.value,
  currencyTime: state.currency.time,
  stats: state.scan.stats,
});

const mapDispatchToProps = dispatch => ({
  setCurrency: ((currency, time) => setCurrency(currency, time, (error , currencyResult) => {
    dispatch(setCurrencyAction(currencyResult.currency, currencyResult.value, currencyResult.time ));
  })),
  drawStatistics: (statistics) => {
    dispatch({ type: 'DRAW_STATS', stats: statistics });
  },
});


export default connect(
    mapStateToProps,
    mapDispatchToProps
)(CurrencyButton);

