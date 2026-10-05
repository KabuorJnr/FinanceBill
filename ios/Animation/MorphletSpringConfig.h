//
//  MorphletSpringConfig.h
//  Pods
//
//  Created by rit3zh CX on 10/1/26.
//

#import <UIKit/UIKit.h>

NS_ASSUME_NONNULL_BEGIN

@interface MorphletSpringConfig : NSObject

@property (nonatomic, readonly) CGFloat mass;
@property (nonatomic, readonly) CGFloat stiffness;
@property (nonatomic, readonly) CGFloat damping;

+ (instancetype)springWithMass:(CGFloat)mass stiffness:(CGFloat)stiffness damping:(CGFloat)damping;

+ (instancetype)springWithResponse:(CGFloat)response dampingFraction:(CGFloat)dampingFraction;

- (instancetype)withoutBounce;

@end

NS_ASSUME_NONNULL_END
