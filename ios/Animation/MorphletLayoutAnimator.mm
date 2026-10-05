//
//  MorphletLayoutAnimator.mm
//  Pods
//
//  Created by rit3zh CX on 10/1/26.
//

#import "MorphletLayoutAnimator.h"
#import "MorphletSpring.h"

#import <React/RCTScrollViewComponentView.h>
#import <React/RCTViewComponentView.h>

@interface MorphletLayoutTransition : NSObject

@property (nonatomic, strong) UIView *view;
@property (nonatomic, assign) CGRect fromBounds;
@property (nonatomic, assign) CGPoint fromCenter;
@property (nonatomic, assign) CGRect toBounds;
@property (nonatomic, assign) CGPoint toCenter;

@end

@implementation MorphletLayoutTransition
@end

@interface MorphletCapturedFrame : NSObject

@property (nonatomic, assign) NSInteger tag;
@property (nonatomic, assign) CGPoint center;
@property (nonatomic, assign) CGSize size;

@end

@implementation MorphletCapturedFrame
@end

@implementation MorphletLayoutAnimator {
  __weak UIView *_rootView;
  NSMapTable<UIView *, MorphletCapturedFrame *> *_capturedFrames;
}

- (instancetype)initWithRootView:(UIView *)rootView {
  if (self = [super init]) {
    _rootView = rootView;
    _capturedFrames = [NSMapTable weakToStrongObjectsMapTable];
  }
  return self;
}

- (void)capture {
  [_capturedFrames removeAllObjects];
  [self forEachDescendantOf:_rootView perform:^(UIView *view) {
    MorphletCapturedFrame *captured = [MorphletCapturedFrame new];
    captured.tag = view.tag;
    captured.center = view.center;
    captured.size = view.bounds.size;
    [self->_capturedFrames setObject:captured forKey:view];
  }];
}

- (void)discard {
  [_capturedFrames removeAllObjects];
}

- (BOOL)animateWithSpring:(MorphletSpringConfig *)spring alongside:(nullable void (^)(void))alongside {
  NSMutableArray<MorphletLayoutTransition *> *transitions = [NSMutableArray array];
  [self forEachDescendantOf:_rootView perform:^(UIView *view) {
    MorphletCapturedFrame *captured = [self->_capturedFrames objectForKey:view];
    if (!captured || captured.tag != view.tag) {
      return;
    }
    CGPoint fromCenter = captured.center;
    CGSize fromSize = captured.size;
    CGPoint toCenter = view.center;
    CGRect toBounds = view.bounds;
    if (CGPointEqualToPoint(fromCenter, toCenter) && CGSizeEqualToSize(fromSize, toBounds.size)) {
      return;
    }
    if (fromSize.width <= 0 || fromSize.height <= 0) {
      return;
    }

    MorphletLayoutTransition *transition = [MorphletLayoutTransition new];
    transition.view = view;
    transition.toCenter = toCenter;
    transition.toBounds = toBounds;
    if ([self resizesContentOf:view]) {
      transition.fromBounds = CGRectMake(toBounds.origin.x, toBounds.origin.y, fromSize.width, fromSize.height);
      transition.fromCenter = fromCenter;
    } else {
      transition.fromBounds = toBounds;
      transition.fromCenter = CGPointMake(
        fromCenter.x - fromSize.width / 2 + toBounds.size.width / 2,
        fromCenter.y - fromSize.height / 2 + toBounds.size.height / 2);
    }
    [transitions addObject:transition];
  }];
  [_capturedFrames removeAllObjects];

  if (transitions.count == 0) {
    return NO;
  }

  [UIView performWithoutAnimation:^{
    for (MorphletLayoutTransition *transition in transitions) {
      transition.view.bounds = transition.fromBounds;
      transition.view.center = transition.fromCenter;
    }
  }];

  [MorphletSpring animateWithSpring:spring
                           velocity:0
                         animations:^{
                           for (MorphletLayoutTransition *transition in transitions) {
                             transition.view.bounds = transition.toBounds;
                             transition.view.center = transition.toCenter;
                           }
                           if (alongside) {
                             alongside();
                           }
                         }
                         completion:nil];
  return YES;
}

- (BOOL)resizesContentOf:(UIView *)view {
  return view.class == RCTViewComponentView.class || [view isKindOfClass:RCTScrollViewComponentView.class];
}

- (void)forEachDescendantOf:(UIView *)parent perform:(void (^)(UIView *view))action {
  for (UIView *subview in parent.subviews) {
    if ([subview isKindOfClass:RCTViewComponentView.class]) {
      action(subview);
    }
    [self forEachDescendantOf:subview perform:action];
  }
}

@end
