import { ControllerHandlerReturnType, HTTPStatus } from '../../typings/app';
export declare function errorHandler(error: Error & {
    statusCode?: HTTPStatus;
}): ControllerHandlerReturnType;
