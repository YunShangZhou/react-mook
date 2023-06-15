import React from 'react';

export interface IProps {
    children?: React.ReactNode
}

export interface responseProps<T> {
    code?: string,
    status?: string | number,
    data?: T,
    message?: string,
}
