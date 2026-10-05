//
//  MorphletViewController+Stack.mm
//  Pods
//
//  Created by rit3zh CX on 10/1/26.
//

#import "MorphletSpring.h"
#import "MorphletViewController+Private.h"
#import "MorphletViewController+Stack.h"

static const CGFloat kStackScaleStep = 0.06;
static const CGFloat kStackMinimumScale = 0.7;
static const CGFloat kStackLiftStep = 14;

@implementation MorphletViewController (Stack)

- (void)pushPresenterStack:(UIViewController *)presenter spring:(MorphletSpringConfig *)spring {
  _didPushStack = [self applyStackFromPresenter:presenter firstDepth:1 spring:spring];
}

- (void)restorePresenterStackWithSpring:(MorphletSpringConfig *)spring {
  if (!_didPushStack) {
    return;
  }
  _didPushStack = NO;
  [self applyStackFromPresenter:self.presentingViewController firstDepth:0 spring:spring];
}

- (BOOL)applyStackFromPresenter:(nullable UIViewController *)presenter
                     firstDepth:(NSInteger)firstDepth
                         spring:(MorphletSpringConfig *)spring {
  NSInteger depth = firstDepth;
  BOOL didApply = NO;
  for (UIViewController *controller = presenter; [controller isKindOfClass:MorphletViewController.class];
       controller = controller.presentingViewController) {
    [(MorphletViewController *)controller setStackDepth:depth spring:spring];
    depth++;
    didApply = YES;
  }
  return didApply;
}

- (void)setStackDepth:(NSInteger)depth spring:(MorphletSpringConfig *)spring {
  if (_stackDepth == depth || !self.isViewLoaded) {
    return;
  }
  _stackDepth = depth;

  CGAffineTransform transform = [self stackTransformForDepth:depth];
  CGFloat backdropAlpha = depth > 0 ? 0 : self.backdropOpacity;
  UIView *stackView = _stackView;
  UIView *backdropView = _backdropView;

  [MorphletSpring animateWithSpring:spring
                           velocity:0
                         animations:^{
                           stackView.transform = transform;
                           backdropView.alpha = backdropAlpha;
                         }
                         completion:nil];
}

- (CGAffineTransform)stackTransformForDepth:(NSInteger)depth {
  if (depth <= 0) {
    return CGAffineTransformIdentity;
  }

  CGFloat scale = MAX(kStackMinimumScale, 1 - kStackScaleStep * depth);
  CGFloat cardTop = _cardView.center.y - _cardView.bounds.size.height / 2;
  CGFloat midY = CGRectGetMidY(_stackView.bounds);
  CGFloat scaledTop = midY + (cardTop - midY) * scale;
  CGFloat lift = cardTop - kStackLiftStep * depth - scaledTop;

  return CGAffineTransformConcat(CGAffineTransformMakeScale(scale, scale), CGAffineTransformMakeTranslation(0, lift));
}

@end
