//
//  MorphletViewControllerDelegate.h
//  Pods
//
//  Created by rit3zh CX on 10/1/26.
//

#import <Foundation/Foundation.h>

NS_ASSUME_NONNULL_BEGIN

@protocol MorphletViewControllerDelegate <NSObject>

- (void)morphletControllerWillPresent;
- (void)morphletControllerDidPresent;
- (void)morphletControllerWillDismiss:(BOOL)interactive;
- (void)morphletControllerDidDismiss;
- (void)morphletControllerInsetsDidChange;

@end

NS_ASSUME_NONNULL_END
