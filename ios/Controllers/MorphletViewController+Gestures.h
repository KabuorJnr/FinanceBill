//
//  MorphletViewController+Gestures.h
//  Pods
//
//  Created by rit3zh CX on 10/1/26.
//

#import "MorphletViewController.h"

NS_ASSUME_NONNULL_BEGIN

@interface MorphletViewController (Gestures)

- (void)handlePan:(UIPanGestureRecognizer *)pan;
- (void)handleBackdropTap:(UITapGestureRecognizer *)tap;

@end

NS_ASSUME_NONNULL_END
