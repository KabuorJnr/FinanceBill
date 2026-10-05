//
//  MorphletViewController+Keyboard.mm
//  Pods
//
//  Created by rit3zh CX on 10/1/26.
//

#import "MorphletViewController+Keyboard.h"
#import "MorphletViewController+Private.h"

@implementation MorphletViewController (Keyboard)

- (void)keyboardWillChangeFrame:(NSNotification *)notification {
  if (!self.isViewLoaded || !self.view.window || _presentationState == MorphletPresentationStateDismissed) {
    return;
  }

  CGRect endFrame = [notification.userInfo[UIKeyboardFrameEndUserInfoKey] CGRectValue];
  CGRect local = [self.view convertRect:endFrame fromView:nil];
  CGFloat overlap = CGRectIsEmpty(endFrame) ? 0 : MAX(0, CGRectGetMaxY(self.view.bounds) - CGRectGetMinY(local));
  [self setKeyboardHeight:overlap notification:notification];
}

- (void)keyboardWillHide:(NSNotification *)notification {
  if (!self.isViewLoaded || _presentationState == MorphletPresentationStateDismissed) {
    return;
  }
  [self setKeyboardHeight:0 notification:notification];
}

- (void)setKeyboardHeight:(CGFloat)height notification:(NSNotification *)notification {
  if (fabs(height - _keyboardHeight) < 0.5) {
    return;
  }
  _keyboardHeight = height;

  NSTimeInterval duration = [notification.userInfo[UIKeyboardAnimationDurationUserInfoKey] doubleValue];
  UIViewAnimationCurve curve =
    (UIViewAnimationCurve)[notification.userInfo[UIKeyboardAnimationCurveUserInfoKey] integerValue];

  [UIView animateWithDuration:duration
                        delay:0
                      options:(UIViewAnimationOptions)(curve << 16) | UIViewAnimationOptionBeginFromCurrentState
                   animations:^{
                     [self applyCardGeometryAnimated:YES];
                   }
                   completion:nil];

  [self.delegate morphletControllerInsetsDidChange];
}

- (void)revealFirstResponder {
  if (_keyboardHeight <= 0 || !self.contentView) {
    return;
  }

  UIView *responder = [self firstResponderIn:self.contentView];
  if (!responder) {
    return;
  }

  UIScrollView *scrollView = nil;
  for (UIView *view = responder.superview; view && view != _cardView; view = view.superview) {
    if ([view isKindOfClass:UIScrollView.class]) {
      scrollView = (UIScrollView *)view;
      break;
    }
  }
  if (!scrollView) {
    return;
  }

  CGRect target = [responder convertRect:responder.bounds toView:scrollView];
  if ([responder conformsToProtocol:@protocol(UITextInput)]) {
    id<UITextInput> input = (id<UITextInput>)responder;
    UITextRange *selection = input.selectedTextRange;
    if (selection) {
      CGRect caret = [input caretRectForPosition:selection.end];
      if (!CGRectIsNull(caret) && !CGRectIsInfinite(caret) && isfinite(caret.origin.y)) {
        target = [responder convertRect:caret toView:scrollView];
      }
    }
  }

  [scrollView scrollRectToVisible:CGRectInset(target, 0, -16) animated:YES];
}

- (nullable UIView *)firstResponderIn:(UIView *)view {
  if (view.isFirstResponder) {
    return view;
  }
  for (UIView *subview in view.subviews) {
    UIView *responder = [self firstResponderIn:subview];
    if (responder) {
      return responder;
    }
  }
  return nil;
}

@end
