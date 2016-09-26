/**
 * formatting information
 **/
module.exports = {
  number: {
    decimal: {
      style: 'decimal'
    },
    integer: {
      style: 'decimal',
      maximumFractionDigits: 0
    },
    currency: {
      style: 'currency',
      currency: 'USD'
    },
    percent: {
      style: 'percent'
    },
    default: {
      style: 'decimal'
    }
  },
  date: {
    short: {
      month: 'numeric',
      day: 'numeric',
      year: '2-digit'
    },
    medium: {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    },
    long: {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    },
    full: {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      weekday: 'long'
    },
    default: {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }
  },
  time: {
    short: {
      hour: 'numeric',
      minute: 'numeric'
    },
    medium: {
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric'
    },
    long: {
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      timeZoneName: 'short'
    },
    full: {
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      timeZoneName: 'short'
    },
    default: {
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric'
    }
  }
}
