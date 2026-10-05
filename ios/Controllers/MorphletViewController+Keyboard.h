//
//  MorphletViewController+Keyboard.h
//  Pods
//
//  Created by rit3zh CX on 10/1/26.
//

#import "MorphletViewController.h"

NS_ASSUME_NONNULL_BEGIN

@interface MorphletViewController (Keyboard)

- (void)keyboardWillChangeFrame:(NSNotification *)notification;
- (void)keyboardWillHide:(NSNotification *)notification;

- (void)revealFirstResponder;

@end

NS_ASSUME_NONNULL_END
