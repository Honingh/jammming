import React, { Component } from 'react';
import './TrackList.css';
import Track from '../Track/Track';

class TrackList extends Component {
    render() {
        return(
            <div className="TrackList">
                {this.props.trackList.map(track => {
                    return <Track key={track.id} track={track} onAdd={this.props.onAdd} onRemove={this.props.onRemove} />
                })}
            </div>
        );
    }
}

export default TrackList;