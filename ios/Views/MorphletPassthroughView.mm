//
//  MorphletPassthroughView.mm
//  Pods
//
//  Created by rit3zh CX on 10/1/26.
//

#import "MorphletPassthroughView.h"

@implementation MorphletPassthroughView

- (nullable UIView *)hitTest:(CGPoint)point withEvent:(nullable UIEvent *)event {
  UIView *hit = [super hitTest:point withEvent:event];
  return hit == self ? nil : hit;
}

@end
